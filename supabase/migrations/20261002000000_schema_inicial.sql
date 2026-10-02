-- =====================================================================
-- TONINHO IMÓVEIS — Estrutura inicial do banco de dados
-- PostgreSQL / Supabase
--
-- Tabelas:
--   admins                   usuários administradores (vinculados ao Supabase Auth)
--   categories               categorias de imóveis (Casa, Apartamento...)
--   features                 características configuráveis (Piscina, Churrasqueira...)
--   properties               imóveis
--   property_images          fotos dos imóveis (arquivos no Supabase Storage)
--   property_features        relação imóvel x característica
--   property_status_history  histórico de alterações de status
--   leads                    interessados / contatos recebidos
--   listing_requests         solicitações "Anuncie seu imóvel"
--   site_settings            configurações da imobiliária (linha única)
-- =====================================================================

create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.property_purpose as enum ('venda', 'aluguel');

create type public.property_status as enum (
  'disponivel', 'reservado', 'vendido', 'alugado', 'indisponivel'
);

create type public.lead_status as enum (
  'novo', 'em_atendimento', 'contato_realizado', 'visita_agendada', 'finalizado'
);

-- ---------------------------------------------------------------------
-- Funções utilitárias
-- ---------------------------------------------------------------------

-- Normaliza texto para busca: minúsculas e sem acentos.
create or replace function public.normalize_text(value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(value, '')));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Administradores
-- ---------------------------------------------------------------------
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  email      text not null,
  created_at timestamptz not null default now()
);

-- Retorna true quando o usuário autenticado é um administrador.
-- SECURITY DEFINER para poder ser usada dentro das políticas RLS sem recursão.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (char_length(name) between 2 and 60),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Características (configuráveis pelo administrador)
-- ---------------------------------------------------------------------
create table public.features (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (char_length(name) between 2 and 60),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Imóveis
-- ---------------------------------------------------------------------
create sequence public.property_code_seq start 1;

-- Próximo código livre (0001, 0002...), pulando códigos já usados manualmente.
create or replace function public.next_property_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := lpad(nextval('public.property_code_seq')::text, 4, '0');
    exit when not exists (select 1 from public.properties p where p.code = candidate);
  end loop;
  return candidate;
end;
$$;

create table public.properties (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique
                  default public.next_property_code()
                  check (code ~ '^[A-Za-z0-9]{1,20}$'),
  title           text not null check (char_length(title) between 3 and 160),
  description     text not null default '',
  purpose         public.property_purpose not null,
  category_id     uuid references public.categories (id) on delete set null,
  status          public.property_status not null default 'disponivel',

  -- Visibilidade no site público (o imóvel nunca some do painel)
  is_published    boolean not null default true,
  is_featured     boolean not null default false,
  is_offer        boolean not null default false,

  price           numeric(14, 2) not null check (price >= 0),
  promo_price     numeric(14, 2) check (promo_price is null or promo_price >= 0),
  -- Preço efetivo usado nos filtros/ordenação (promocional quando em oferta)
  effective_price numeric(14, 2) generated always as (
                    case when is_offer and promo_price is not null then promo_price else price end
                  ) stored,

  -- Localização
  zip_code        text not null default '',
  state           text not null default '',
  city            text not null,
  neighborhood    text not null default '',
  address         text not null default '',
  address_number  text not null default '',
  complement      text not null default '',
  show_address    boolean not null default false,

  -- Detalhes
  bedrooms        integer not null default 0 check (bedrooms >= 0),
  suites          integer not null default 0 check (suites >= 0),
  bathrooms       integer not null default 0 check (bathrooms >= 0),
  parking_spots   integer not null default 0 check (parking_spots >= 0),
  total_area      numeric(12, 2) check (total_area is null or total_area >= 0),
  built_area      numeric(12, 2) check (built_area is null or built_area >= 0),
  condo_fee       numeric(12, 2) check (condo_fee is null or condo_fee >= 0),
  iptu            numeric(12, 2) check (iptu is null or iptu >= 0),

  -- Mantidos automaticamente por triggers
  cover_image_url text,
  search_text     text not null default '',

  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint promo_requires_offer check (
    not is_offer or (promo_price is not null and promo_price < price)
  )
);

create index properties_public_idx on public.properties (is_published, purpose, status);
create index properties_category_idx on public.properties (category_id);
create index properties_city_idx on public.properties (city);
create index properties_effective_price_idx on public.properties (effective_price);
create index properties_created_at_idx on public.properties (created_at desc);
create index properties_featured_idx on public.properties (is_featured) where is_featured;
create index properties_offer_idx on public.properties (is_offer) where is_offer;

create trigger properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create or replace function public.properties_search_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_text = public.normalize_text(
    concat_ws(' ', new.code, new.title, new.neighborhood, new.city, new.state, new.address)
  );
  return new;
end;
$$;

create trigger properties_search_text
  before insert or update of code, title, neighborhood, city, state, address on public.properties
  for each row execute function public.properties_search_text();

-- ---------------------------------------------------------------------
-- Histórico de status
-- ---------------------------------------------------------------------
create table public.property_status_history (
  id          bigint generated always as identity primary key,
  property_id uuid not null references public.properties (id) on delete cascade,
  old_status  public.property_status,
  new_status  public.property_status not null,
  changed_by  uuid references auth.users (id) on delete set null,
  changed_at  timestamptz not null default now()
);

create index property_status_history_property_idx
  on public.property_status_history (property_id, changed_at desc);

create or replace function public.log_property_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.property_status_history (property_id, old_status, new_status, changed_by)
    values (
      new.id,
      case when tg_op = 'UPDATE' then old.status end,
      new.status,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger properties_status_history
  after insert or update of status on public.properties
  for each row execute function public.log_property_status();

-- ---------------------------------------------------------------------
-- Fotos
-- ---------------------------------------------------------------------
create table public.property_images (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties (id) on delete cascade,
  url          text not null,
  storage_path text,
  position     integer not null default 0,
  is_cover     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index property_images_property_idx on public.property_images (property_id, position);
create unique index property_images_one_cover_idx
  on public.property_images (property_id) where is_cover;

-- Atualiza properties.cover_image_url sempre que as fotos mudam.
create or replace function public.refresh_property_cover()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.property_id, old.property_id);
begin
  update public.properties p
     set cover_image_url = (
       select i.url
         from public.property_images i
        where i.property_id = target
        order by i.is_cover desc, i.position asc, i.created_at asc
        limit 1
     )
   where p.id = target;
  return null;
end;
$$;

create trigger property_images_refresh_cover
  after insert or update or delete on public.property_images
  for each row execute function public.refresh_property_cover();

-- ---------------------------------------------------------------------
-- Características por imóvel
-- ---------------------------------------------------------------------
create table public.property_features (
  property_id uuid not null references public.properties (id) on delete cascade,
  feature_id  uuid not null references public.features (id) on delete cascade,
  primary key (property_id, feature_id)
);

create index property_features_feature_idx on public.property_features (feature_id);

-- ---------------------------------------------------------------------
-- Interessados (leads)
-- ---------------------------------------------------------------------
create table public.leads (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid references public.properties (id) on delete set null,
  -- Cópia do código/título no momento do contato (preservada mesmo se o imóvel for excluído)
  property_code  text,
  property_title text,
  name           text not null check (char_length(name) between 2 and 120),
  phone          text not null check (char_length(phone) between 8 and 30),
  email          text not null default '' check (char_length(email) <= 160),
  message        text not null default '' check (char_length(message) <= 2000),
  status         public.lead_status not null default 'novo',
  notes          text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- Preenche código/título do imóvel no servidor (o visitante não pode falsificar).
create or replace function public.leads_fill_property()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.property_id is not null then
    select p.code, p.title into new.property_code, new.property_title
      from public.properties p
     where p.id = new.property_id;
  end if;
  return new;
end;
$$;

create trigger leads_fill_property
  before insert on public.leads
  for each row execute function public.leads_fill_property();

-- ---------------------------------------------------------------------
-- Solicitações de anúncio ("Anuncie seu imóvel")
-- ---------------------------------------------------------------------
create table public.listing_requests (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(name) between 2 and 120),
  phone             text not null check (char_length(phone) between 8 and 30),
  email             text not null default '' check (char_length(email) <= 160),
  property_type     text not null default '' check (char_length(property_type) <= 60),
  purpose           public.property_purpose not null,
  city              text not null default '' check (char_length(city) <= 120),
  neighborhood      text not null default '' check (char_length(neighborhood) <= 120),
  approximate_value numeric(14, 2) check (approximate_value is null or approximate_value >= 0),
  description       text not null default '' check (char_length(description) <= 3000),
  status            public.lead_status not null default 'novo',
  notes             text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index listing_requests_created_at_idx on public.listing_requests (created_at desc);

create trigger listing_requests_updated_at
  before update on public.listing_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Configurações da imobiliária (linha única, id = 1)
-- ---------------------------------------------------------------------
create table public.site_settings (
  id             smallint primary key default 1 check (id = 1),
  company_name   text not null default 'Toninho Imóveis',
  logo_url       text,
  phone          text not null default '',
  whatsapp       text not null default '',
  email          text not null default '',
  address        text not null default '',
  instagram      text not null default '',
  facebook       text not null default '',
  business_hours text not null default '',
  about_text     text not null default '',
  creci          text not null default '',
  updated_at     timestamptz not null default now()
);

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (1) on conflict do nothing;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.admins                  enable row level security;
alter table public.categories              enable row level security;
alter table public.features                enable row level security;
alter table public.properties              enable row level security;
alter table public.property_images         enable row level security;
alter table public.property_features       enable row level security;
alter table public.property_status_history enable row level security;
alter table public.leads                   enable row level security;
alter table public.listing_requests        enable row level security;
alter table public.site_settings           enable row level security;

-- Admins: cada usuário vê o próprio registro; administradores veem todos.
-- A inclusão de novos administradores é feita com a service role (script/painel).
create policy "admins_select" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "admins_delete" on public.admins
  for delete to authenticated
  using ((select public.is_admin()) and user_id <> (select auth.uid()));

-- Categorias e características: leitura pública, escrita apenas admin.
create policy "categories_select" on public.categories
  for select to anon, authenticated using (true);
create policy "categories_write" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "features_select" on public.features
  for select to anon, authenticated using (true);
create policy "features_write" on public.features
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Imóveis: público vê apenas os publicados; admin vê e altera tudo.
create policy "properties_select" on public.properties
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "properties_write" on public.properties
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "property_images_select" on public.property_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.properties p
     where p.id = property_id and (p.is_published or (select public.is_admin()))
  ));
create policy "property_images_write" on public.property_images
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "property_features_select" on public.property_features
  for select to anon, authenticated
  using (exists (
    select 1 from public.properties p
     where p.id = property_id and (p.is_published or (select public.is_admin()))
  ));
create policy "property_features_write" on public.property_features
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Histórico: somente leitura para admin (gravação via trigger).
create policy "status_history_select" on public.property_status_history
  for select to authenticated using ((select public.is_admin()));

-- Leads: qualquer visitante pode ENVIAR (insert) um contato novo;
-- somente admin pode ler, alterar ou excluir.
create policy "leads_insert_public" on public.leads
  for insert to anon, authenticated
  with check (status = 'novo' and notes = '');
create policy "leads_admin_select" on public.leads
  for select to authenticated using ((select public.is_admin()));
create policy "leads_admin_update" on public.leads
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "leads_admin_delete" on public.leads
  for delete to authenticated using ((select public.is_admin()));

create policy "listing_requests_insert_public" on public.listing_requests
  for insert to anon, authenticated
  with check (status = 'novo' and notes = '');
create policy "listing_requests_admin_select" on public.listing_requests
  for select to authenticated using ((select public.is_admin()));
create policy "listing_requests_admin_update" on public.listing_requests
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "listing_requests_admin_delete" on public.listing_requests
  for delete to authenticated using ((select public.is_admin()));

-- Configurações: leitura pública, alteração apenas admin.
create policy "site_settings_select" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings_update" on public.site_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Privilégios mínimos para o papel anônimo (além do RLS).
revoke insert, update, delete on all tables in schema public from anon;
grant select on public.categories, public.features, public.properties,
  public.property_images, public.property_features, public.site_settings to anon;
grant insert on public.leads, public.listing_requests to anon;

-- =====================================================================
-- Supabase Storage — bucket público para fotos (leitura pública,
-- upload/alteração/exclusão apenas por administradores)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'imoveis', 'imoveis', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "imoveis_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imoveis' and (select public.is_admin()));

create policy "imoveis_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'imoveis' and (select public.is_admin()));

create policy "imoveis_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'imoveis' and (select public.is_admin()));

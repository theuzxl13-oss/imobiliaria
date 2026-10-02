-- =====================================================================
-- TONINHO IMÓVEIS — Dados iniciais e de DEMONSTRAÇÃO
--
-- Categorias e características são dados reais de configuração.
-- Os IMÓVEIS abaixo são FICTÍCIOS (cidade "Cidade Modelo") e servem
-- apenas para testar o sistema. Podem ser excluídos pelo painel.
-- =====================================================================

-- Categorias ----------------------------------------------------------
insert into public.categories (name, slug, sort_order) values
  ('Casa',        'casa',        1),
  ('Apartamento', 'apartamento', 2),
  ('Terreno',     'terreno',     3),
  ('Comercial',   'comercial',   4),
  ('Chácara',     'chacara',     5),
  ('Sítio',       'sitio',       6),
  ('Fazenda',     'fazenda',     7),
  ('Condomínio',  'condominio',  8),
  ('Outros',      'outros',      9)
on conflict (slug) do nothing;

-- Características -----------------------------------------------------
insert into public.features (name, sort_order) values
  ('Piscina', 1), ('Churrasqueira', 2), ('Varanda', 3), ('Quintal', 4),
  ('Área gourmet', 5), ('Ar-condicionado', 6), ('Mobiliado', 7), ('Portaria', 8),
  ('Elevador', 9), ('Academia', 10), ('Salão de festas', 11), ('Aceita animais', 12),
  ('Playground', 13), ('Lavanderia', 14), ('Armários planejados', 15), ('Energia solar', 16)
on conflict (name) do nothing;

-- Configurações -------------------------------------------------------
update public.site_settings set
  company_name   = 'Toninho Imóveis',
  phone          = '(00) 0000-0000',
  whatsapp       = '5500000000000',
  email          = 'contato@toninhoimoveis.com.br',
  address        = 'Rua Exemplo, 100 — Centro, Cidade Modelo/SP',
  instagram      = '',
  facebook       = '',
  business_hours = 'Segunda a sexta, das 8h às 18h · Sábado, das 8h às 12h',
  creci          = '',
  about_text     = E'A Toninho Imóveis nasceu para tornar a compra, a venda e a locação de imóveis uma experiência simples, transparente e segura.\n\nCom atendimento próximo e conhecimento profundo da região, acompanhamos cada cliente do primeiro contato até a entrega das chaves, cuidando de toda a documentação com responsabilidade.\n\nNosso compromisso é encontrar o imóvel certo para cada momento da sua vida.'
where id = 1;

-- Imóveis fictícios ---------------------------------------------------
with cat as (select slug, id from public.categories)
insert into public.properties (
  code, title, description, purpose, category_id, status, is_published, is_featured, is_offer,
  price, promo_price, zip_code, state, city, neighborhood, address, address_number, show_address,
  bedrooms, suites, bathrooms, parking_spots, total_area, built_area, condo_fee, iptu
) values
  ('0001', 'Casa com 3 quartos e piscina no Centro',
   E'Imóvel fictício de demonstração.\n\nCasa ampla e iluminada, com sala de estar integrada à cozinha, área gourmet com churrasqueira e piscina. Quintal gramado, ótima ventilação e localização próxima a escolas, mercados e farmácias.',
   'venda', (select id from cat where slug = 'casa'), 'disponivel', true, true, false,
   650000, null, '00000-000', 'SP', 'Cidade Modelo', 'Centro', 'Rua das Palmeiras', '120', false,
   3, 1, 3, 2, 300, 180, null, 2400),

  ('0002', 'Apartamento 2 quartos mobiliado no Jardim América',
   E'Imóvel fictício de demonstração.\n\nApartamento mobiliado com varanda, armários planejados e ar-condicionado. Condomínio com portaria 24h, elevador, academia e salão de festas.',
   'aluguel', (select id from cat where slug = 'apartamento'), 'disponivel', true, true, false,
   2200, null, '00000-000', 'SP', 'Cidade Modelo', 'Jardim América', 'Avenida Brasil', '850', false,
   2, 1, 2, 1, 68, 68, 450, 90),

  ('0003', 'Terreno plano de 360 m² no Residencial Bela Vista',
   E'Imóvel fictício de demonstração.\n\nTerreno plano, pronto para construir, em bairro residencial em crescimento. Documentação em dia.',
   'venda', (select id from cat where slug = 'terreno'), 'disponivel', true, false, true,
   140000, 125000, '00000-000', 'SP', 'Cidade Modelo', 'Residencial Bela Vista', 'Rua Projetada 5', '', false,
   0, 0, 0, 0, 360, null, null, 300),

  ('0004', 'Chácara com casa sede e pomar a 5 km da cidade',
   E'Imóvel fictício de demonstração.\n\nChácara com casa sede de 3 quartos, varanda ampla, pomar formado, poço artesiano e área de lazer com piscina e churrasqueira. Ideal para descanso com a família.',
   'venda', (select id from cat where slug = 'chacara'), 'disponivel', true, true, true,
   890000, 790000, '00000-000', 'SP', 'Cidade Modelo', 'Zona Rural', 'Estrada Municipal', 'km 5', false,
   3, 1, 2, 4, 5000, 220, null, 800),

  ('0005', 'Sala comercial de 45 m² no Centro',
   E'Imóvel fictício de demonstração.\n\nSala comercial em prédio com elevador e portaria, recepção, banheiro privativo e ar-condicionado. Excelente para escritórios e consultórios.',
   'aluguel', (select id from cat where slug = 'comercial'), 'disponivel', true, false, false,
   1800, null, '00000-000', 'SP', 'Cidade Modelo', 'Centro', 'Rua XV de Novembro', '300', true,
   0, 0, 1, 1, 45, 45, 380, 120),

  ('0006', 'Casa térrea em condomínio fechado com área gourmet',
   E'Imóvel fictício de demonstração.\n\nCasa térrea em condomínio com segurança 24h, 3 suítes, área gourmet integrada, piscina e energia solar. Acabamento de alto padrão.',
   'venda', (select id from cat where slug = 'condominio'), 'disponivel', true, true, false,
   1150000, null, '00000-000', 'SP', 'Cidade Modelo', 'Condomínio Recanto Verde', 'Alameda das Flores', '45', false,
   3, 3, 4, 3, 450, 260, 690, 3800),

  ('0007', 'Apartamento 3 quartos com sacada na Vila Nova',
   E'Imóvel fictício de demonstração.\n\nApartamento com 3 quartos sendo 1 suíte, sacada com churrasqueira, 2 vagas de garagem e lazer completo no condomínio.',
   'venda', (select id from cat where slug = 'apartamento'), 'disponivel', true, false, true,
   420000, 389000, '00000-000', 'SP', 'Cidade Modelo', 'Vila Nova', 'Rua dos Ipês', '210', false,
   3, 1, 2, 2, 92, 92, 520, 1100),

  ('0008', 'Casa 2 quartos com quintal no Jardim das Flores',
   E'Imóvel fictício de demonstração.\n\nCasa aconchegante com 2 quartos, quintal amplo, lavanderia coberta e garagem. Aceita animais.',
   'aluguel', (select id from cat where slug = 'casa'), 'disponivel', true, false, false,
   1500, null, '00000-000', 'SP', 'Cidade Modelo', 'Jardim das Flores', 'Rua das Margaridas', '77', false,
   2, 0, 1, 1, 200, 90, null, 60),

  ('0009', 'Sítio com 4 alqueires, nascente e curral',
   E'Imóvel fictício de demonstração.\n\nSítio com casa sede, curral, nascente e pastagem formada. Exemplo de imóvel VENDIDO mantido no histórico.',
   'venda', (select id from cat where slug = 'sitio'), 'vendido', true, false, false,
   1300000, null, '00000-000', 'SP', 'Cidade Modelo', 'Zona Rural', 'Estrada do Sertãozinho', 's/n', false,
   2, 0, 1, 2, 96800, 150, null, null)
on conflict (code) do nothing;

-- Fotos (Unsplash — imagens ilustrativas) -----------------------------
insert into public.property_images (property_id, url, position, is_cover)
select p.id, 'https://images.unsplash.com/photo-' || v.photo || '?auto=format&fit=crop&w=1600&q=80', v.pos, v.pos = 0
from (values
  ('0001', '1564013799919-ab600027ffc6', 0),
  ('0001', '1600607687939-ce8a6c25118c', 1),
  ('0001', '1600566753190-17f0baa2a6c3', 2),
  ('0001', '1505691938895-1758d7feb511', 3),
  ('0002', '1522708323590-d24dbb6b0267', 0),
  ('0002', '1502672260266-1c1ef2d93688', 1),
  ('0002', '1484154218962-a197022b5858', 2),
  ('0003', '1500382017468-9049fed747ef', 0),
  ('0004', '1568605114967-8130f3a36994', 0),
  ('0004', '1600210492486-724fe5c67fb0', 1),
  ('0005', '1497366216548-37526070297c', 0),
  ('0005', '1486406146926-c627a92ad1ab', 1),
  ('0006', '1613490493576-7fde63acd811', 0),
  ('0006', '1600596542815-ffad4c1539a9', 1),
  ('0006', '1600585154340-be6161a56a0c', 2),
  ('0007', '1560448204-e02f11c3d0e2', 0),
  ('0007', '1493809842364-78817add7ffb', 1),
  ('0008', '1570129477492-45c003edd2be', 0),
  ('0009', '1500382017468-9049fed747ef', 0)
) as v(code, photo, pos)
join public.properties p on p.code = v.code
where not exists (select 1 from public.property_images i where i.property_id = p.id);

-- Características dos imóveis -----------------------------------------
insert into public.property_features (property_id, feature_id)
select p.id, f.id
from (values
  ('0001', 'Piscina'), ('0001', 'Churrasqueira'), ('0001', 'Quintal'), ('0001', 'Área gourmet'), ('0001', 'Aceita animais'),
  ('0002', 'Varanda'), ('0002', 'Mobiliado'), ('0002', 'Ar-condicionado'), ('0002', 'Portaria'), ('0002', 'Elevador'),
  ('0002', 'Academia'), ('0002', 'Salão de festas'), ('0002', 'Armários planejados'),
  ('0004', 'Piscina'), ('0004', 'Churrasqueira'), ('0004', 'Varanda'), ('0004', 'Aceita animais'),
  ('0005', 'Ar-condicionado'), ('0005', 'Elevador'), ('0005', 'Portaria'),
  ('0006', 'Piscina'), ('0006', 'Área gourmet'), ('0006', 'Portaria'), ('0006', 'Energia solar'), ('0006', 'Playground'),
  ('0007', 'Varanda'), ('0007', 'Churrasqueira'), ('0007', 'Elevador'), ('0007', 'Salão de festas'), ('0007', 'Playground'),
  ('0008', 'Quintal'), ('0008', 'Lavanderia'), ('0008', 'Aceita animais')
) as v(code, feature)
join public.properties p on p.code = v.code
join public.features f on f.name = v.feature
on conflict do nothing;

-- Ajusta a sequência de códigos para continuar após os imóveis de demonstração.
select setval('public.property_code_seq', greatest((select count(*) from public.properties), 1));

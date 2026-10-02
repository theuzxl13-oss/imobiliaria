# 🏠 Toninho Imóveis

Plataforma imobiliária completa da **Toninho Imóveis**: site público para anunciar imóveis à **venda** e para **aluguel** + **painel administrativo** para cadastrar e administrar imóveis, fotos, ofertas, destaques e contatos.

Tudo fica salvo em banco de dados real (Supabase/PostgreSQL). Nenhuma informação importante depende do navegador.

> 🎬 **Demonstração para apresentação:** https://theuzxl13-oss.github.io/imobiliaria/
> Versão visual e clicável do site e do painel, com imóveis fictícios e sem banco de dados (as alterações ficam salvas só no navegador de quem está usando; o botão "Restaurar demo" volta ao padrão).
> O arquivo fica em `docs/index.html`; a cópia publicada pelo GitHub Pages fica na branch `gh-pages` (para atualizar, copie o arquivo para lá).

### 🤖 Assistente virtual (chatbot) da demonstração

O botão **"Fale com o Toni"** abre um chat que faz o primeiro atendimento do cliente: entende o que ele procura, indica imóveis do catálogo (como cartões clicáveis), tira dúvidas, anota nome e telefone (vira um registro em **Interessados**) e passa para o corretor no WhatsApp já com o resumo da conversa.

No painel, em **Assistente virtual**, você configura o nome, a mensagem de boas-vindas, as instruções de atendimento, as informações da imobiliária, as perguntas frequentes e as sugestões rápidas. Em **Conversas do chat** ficam todas as conversas.

- **Sem chave de IA:** funciona no *modo básico* (perguntas frequentes, contatos e busca de imóveis por palavras-chave).
- **Com o Gemini (gratuito):** crie uma chave em <https://aistudio.google.com/apikey>, cole em **Assistente virtual → Conexão com o Gemini** e clique em *Testar conexão*. Nesta demonstração a chave fica salva **apenas no navegador** de quem a colou (ótimo para apresentar).
- **Para todos os visitantes usarem a IA sem expor a chave:** publique o proxy `chatbot-proxy/worker.mjs` no Cloudflare Workers (plano gratuito):
  1. Em <https://dash.cloudflare.com> → **Workers & Pages → Create → Worker**, cole o conteúdo de `chatbot-proxy/worker.mjs` e clique em **Deploy**.
  2. Em **Settings → Variables and Secrets**, adicione o secret `GEMINI_API_KEY` com a sua chave (e, se o site mudar de endereço, `ALLOWED_ORIGINS`).
  3. Coloque a URL do Worker (ex.: `https://toninho-chat.SEU-USUARIO.workers.dev`) na constante `GEMINI_PROXY_URL` no início do script de `docs/index.html` e publique novamente.

> ⚠️ Nunca coloque a chave do Gemini diretamente no código do site: qualquer pessoa conseguiria copiá-la.

---

## Sumário

1. [Funcionalidades](#-funcionalidades)
2. [Tecnologias](#-tecnologias)
3. [Estrutura do projeto](#-estrutura-do-projeto)
4. [Banco de dados](#-banco-de-dados)
5. [Variáveis de ambiente](#-variáveis-de-ambiente)
6. [Como instalar e executar localmente](#-como-instalar-e-executar-localmente)
7. [Como configurar o Supabase (produção)](#-como-configurar-o-supabase-produção)
8. [Como criar o primeiro administrador](#-como-criar-o-primeiro-administrador)
9. [Como publicar na Vercel](#-como-publicar-na-vercel)
10. [Como configurar o domínio](#-como-configurar-o-domínio)
11. [Manutenção](#-manutenção)
12. [Segurança](#-segurança)

---

## ✨ Funcionalidades

### Site público
| Página | Endereço | Destaques |
|---|---|---|
| Início | `/` | Banner com busca (Comprar/Alugar, cidade ou bairro, tipo, faixa de preço), destaques, venda, aluguel, ofertas, categorias, anuncie, sobre e contato |
| Comprar | `/comprar` | Somente imóveis à venda, com busca avançada |
| Alugar | `/alugar` | Somente imóveis para aluguel, com busca avançada |
| Imóveis | `/imoveis` | Todos os imóveis, com busca avançada |
| Ofertas | `/ofertas` | Imóveis em oferta exibindo **DE: R$ … POR: R$ …** |
| Imóvel | `/imovel/casa-3-quartos-centro-0001` | URL amigável, galeria com tela cheia, características, WhatsApp com o código, formulário de interesse, compartilhar |
| Sobre nós | `/sobre` | Texto editável pelo painel |
| Contato | `/contato` | WhatsApp, telefone, e-mail, endereço, horário e formulário |
| Anuncie seu imóvel | `/anuncie` | Formulário "Enviar para avaliação" |

- **Busca avançada** combinável: venda/aluguel, palavra-chave/código, cidade, bairro, tipo, quartos, banheiros, vagas, valor mín./máx., área mín./máx., ordenação e paginação. A busca ignora acentos ("sao jose" encontra "São José").
- **WhatsApp**: botão flutuante em todas as páginas e botão "Tenho interesse neste imóvel" com a mensagem automática _"Olá! Vi o imóvel código #0001 no site da Toninho Imóveis e gostaria de mais informações."_
- **SEO**: title/description por página, Open Graph (foto, título e preço ao compartilhar), `sitemap.xml`, `robots.txt`, dados estruturados (schema.org) e URLs amigáveis. Se o bairro ou a categoria mudar, a URL antiga redireciona para a nova automaticamente.
- **Experiência**: skeleton loading, mensagens de erro amigáveis, página 404, estado "nenhum imóvel encontrado", proteção anti-spam (honeypot) nos formulários.
- 100% responsivo (celular, tablet, notebook e computador).

### Painel administrativo (`/admin`)
- **Login** com Supabase Auth. Sem login nada do painel fica acessível.
- **Dashboard**: total de imóveis, à venda, para aluguel, disponíveis, vendidos, alugados, em destaque, em oferta, contatos recebidos, novas solicitações, últimos imóveis e últimos contatos.
- **Cadastrar/Editar imóvel**: código (automático ou manual), título, descrição, finalidade, categoria, status, preço, preço promocional, CEP (preenche o endereço automaticamente), estado, cidade, bairro, endereço, número, complemento, dormitórios, suítes, banheiros, vagas, áreas, condomínio, IPTU, características, fotos, publicação e destaque.
- **Fotos**: envio de várias imagens de uma vez (comprimidas automaticamente no navegador antes do envio), escolher a foto principal, alterar a ordem, excluir e adicionar novas.
- **Gerenciar imóveis**: tabela com código, foto, título, categoria, venda/aluguel, preço, status e data, busca por código/título/bairro/cidade e ações **Editar, Visualizar, Destacar, Criar oferta, Marcar vendido, Marcar alugado, Desativar e Excluir** (com confirmação).
- **Status**: Disponível, Reservado, Vendido, Alugado e Indisponível. Vendidos e alugados **nunca somem do painel**. O administrador decide se continuam no site ("Publicado no site"), e cada mudança fica no **histórico de status**.
- **Interessados**: contatos com nome, telefone, e-mail, mensagem, imóvel, código, data e status do atendimento (Novo, Em atendimento, Contato realizado, Visita agendada, Finalizado), além de anotações internas e atalho para o WhatsApp do cliente.
- **Anuncie seu imóvel**: solicitações dos proprietários com o mesmo controle de status.
- **Características e categorias**: totalmente configuráveis.
- **Configurações**: nome, logotipo, telefone, WhatsApp, e-mail, endereço, Instagram, Facebook, horário, CRECI e texto "Sobre nós". Tudo aparece automaticamente no site.
- **Usuários**: adicionar e remover administradores.
- Toasts de sucesso/erro em todas as ações.

---

## 🧰 Tecnologias

| Tecnologia | Uso |
|---|---|
| [Next.js 16](https://nextjs.org) (App Router) | Site e painel, Server Components, Server Actions, ISR |
| TypeScript | Tipagem de todo o projeto |
| Tailwind CSS 4 | Interface responsiva e identidade visual |
| Supabase (PostgreSQL) | Banco de dados com Row Level Security |
| Supabase Auth | Login dos administradores |
| Supabase Storage | Armazenamento das fotos e do logotipo |
| [zod](https://zod.dev) | Validação dos formulários no servidor |
| [lucide-react](https://lucide.dev) | Ícones |
| [sonner](https://sonner.emilkowal.ski) | Notificações (toasts) |
| Vercel | Hospedagem |

---

## 📁 Estrutura do projeto

```
├── .github/workflows/ci.yml      # Verificação automática (lint, tipos e build)
├── public/                       # Arquivos estáticos (imagem padrão de imóvel sem foto)
├── scripts/create-admin.mjs      # Cria o primeiro administrador
├── supabase/
│   ├── config.toml               # Configuração do Supabase local
│   ├── migrations/               # Estrutura do banco (tabelas, RLS, triggers, Storage)
│   └── seed.sql                  # Categorias, características e imóveis de DEMONSTRAÇÃO
└── src/
    ├── proxy.ts                  # Protege /admin e renova a sessão
    ├── app/
    │   ├── (site)/               # Site público (home, comprar, alugar, imóvel, ofertas...)
    │   ├── admin/login/          # Tela de login
    │   ├── admin/(painel)/       # Painel (dashboard, imóveis, interessados, configurações...)
    │   ├── sitemap.ts, robots.ts # SEO
    │   └── layout.tsx            # Layout raiz, fonte e metadados
    ├── components/
    │   ├── site/                 # Componentes do site (cards, filtros, galeria, formulários)
    │   ├── admin/                # Componentes do painel (formulário, fotos, ações)
    │   └── ui/                   # Campos de formulário reutilizáveis
    └── lib/
        ├── supabase/             # Clientes Supabase (servidor, navegador, público, service)
        ├── actions/              # Server Actions (público e administrativo)
        ├── queries.ts            # Consultas do site público
        ├── admin-queries.ts      # Consultas do painel
        ├── validation.ts         # Validações (zod)
        └── format.ts, types.ts…  # Utilitários e tipos
```

---

## 🗄 Banco de dados

A estrutura completa está em `supabase/migrations/20261002000000_schema_inicial.sql`.

| Tabela | Conteúdo |
|---|---|
| `admins` | Usuários administradores (ligados ao Supabase Auth) |
| `categories` | Categorias: Casa, Apartamento, Terreno, Comercial, Chácara, Sítio, Fazenda, Condomínio, Outros |
| `features` | Características: Piscina, Churrasqueira, Varanda… |
| `properties` | Imóveis (código, título, descrição, finalidade, status, preços, localização, detalhes, publicado, destaque, oferta) |
| `property_images` | Fotos de cada imóvel (URL, caminho no Storage, ordem, foto principal) |
| `property_features` | Características de cada imóvel |
| `property_status_history` | Histórico automático de mudanças de status |
| `leads` | Interessados (formulário do imóvel e de contato) |
| `listing_requests` | Solicitações "Anuncie seu imóvel" |
| `site_settings` | Configurações da imobiliária (linha única) |

**Automatizações no banco (triggers):**
- código sequencial automático (`0001`, `0002`…) que pula códigos já usados;
- `effective_price`: preço promocional quando em oferta (usado em filtros e ordenação);
- `cover_image_url`: foto principal sempre atualizada;
- `search_text`: texto normalizado sem acentos para a busca;
- histórico de status gravado automaticamente;
- código e título do imóvel copiados para o contato (ficam preservados mesmo se o imóvel for excluído).

**Regras de acesso (Row Level Security):**
- visitantes só **leem** imóveis publicados, fotos, categorias, características e configurações;
- visitantes só podem **enviar** contatos e solicitações (não conseguem lê-los);
- toda escrita exige um usuário autenticado **e** cadastrado na tabela `admins`;
- o bucket `imoveis` do Storage é público para leitura, e o envio/exclusão de arquivos é exclusivo de administradores.

---

## 🔑 Variáveis de ambiente

Copie `.env.example` para `.env.local` (local) ou cadastre na Vercel (produção):

| Variável | Obrigatória | Onde encontrar | Descrição |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase → Project Settings → API → Project URL | Endereço do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase → Project Settings → API Keys → `anon` / `publishable` | Chave pública (protegida pelas regras RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Recomendada | Supabase → Project Settings → API Keys → `service_role` / `secret` | **Secreta.** Usada para criar administradores. Nunca use o prefixo `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | ✅ em produção | Seu domínio, ex.: `https://www.toninhoimoveis.com.br` | Usada no SEO, sitemap e links de compartilhamento |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Opcional | — | WhatsApp padrão (ex.: `5511999999999`). O número salvo no painel tem prioridade |

> ⚠️ O arquivo `.env.local` está no `.gitignore` e **nunca** deve ser enviado ao GitHub.

---

## 💻 Como instalar e executar localmente

Pré-requisitos: **Node.js 22** (ou 20.19+), **npm** e, para o banco local, **Docker**.

```bash
# 1. Baixe o projeto
git clone https://github.com/theuzxl13-oss/imobiliaria.git
cd imobiliaria

# 2. Instale as dependências
npm install

# 3. Configure as variáveis
cp .env.example .env.local
```

### Opção A: usar um projeto Supabase na nuvem
Siga [Como configurar o Supabase](#-como-configurar-o-supabase-produção) e preencha o `.env.local` com as chaves do projeto.

### Opção B: Supabase local (Docker)
```bash
npm run db:start      # sobe o Supabase local, aplica a estrutura e os dados de demonstração
```
O comando mostra a `API_URL`, a `ANON_KEY` e a `SERVICE_ROLE_KEY`. Coloque-as no `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Executar
```bash
npm run admin:create -- seu@email.com "SuaSenhaForte" "Seu Nome"   # cria o administrador
npm run dev                                                         # http://localhost:3000
```
- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

### Comandos úteis
| Comando | O que faz |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm run lint` | Verificação de código (ESLint) |
| `npm run typecheck` | Verificação de tipos (TypeScript) |
| `npm run admin:create -- email senha "Nome"` | Cria/promove um administrador |
| `npm run db:start` / `db:stop` / `db:reset` | Supabase local (reset recria o banco com os dados de demonstração) |

---

## ☁️ Como configurar o Supabase (produção)

1. Crie uma conta em <https://supabase.com> e clique em **New project**.
   - Nome: `toninho-imoveis`
   - Região: **South America (São Paulo)**
   - Anote a senha do banco.
2. **Criar a estrutura do banco:** abra **SQL Editor → New query**, cole **todo** o conteúdo de
   `supabase/migrations/20261002000000_schema_inicial.sql` e clique em **Run**.
3. **Dados iniciais:** em uma nova query, cole o conteúdo de `supabase/seed.sql` e clique em **Run**.
   Isso cria as categorias, as características, as configurações e **9 imóveis fictícios de demonstração** (cidade "Cidade Modelo"), que você pode excluir depois pelo painel.
   > Se preferir começar sem os imóveis de demonstração, execute apenas os blocos de categorias, características e configurações do arquivo.
4. **Bloquear cadastro público:** em **Authentication → Sign In / Providers**, desative **"Allow new users to sign up"**. Assim, somente administradores criam contas. O provedor **Email** deve continuar **ativado**.
5. **URLs de autenticação:** em **Authentication → URL Configuration**, defina o **Site URL** com o endereço do site (ex.: `https://www.toninhoimoveis.com.br`).
6. **Chaves:** em **Project Settings → API Keys**, copie a URL do projeto, a chave `anon`/`publishable` e a chave `service_role`/`secret` para as variáveis de ambiente.
7. O bucket de fotos **`imoveis`** é criado automaticamente pela migração (confira em **Storage**).

> Alternativa pela linha de comando: `npx supabase login`, `npx supabase link --project-ref SEU_REF` e `npx supabase db push`.

---

## 👤 Como criar o primeiro administrador

**Opção 1: pelo comando (recomendado)**

Com `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` do projeto de produção no `.env.local`:
```bash
npm run admin:create -- toninho@toninhoimoveis.com.br "UmaSenhaForte!2026" "Toninho"
```

**Opção 2: pelo painel do Supabase**
1. **Authentication → Users → Add user → Create new user**, informe e-mail e senha e marque **Auto Confirm User**.
2. Copie o **UID** do usuário criado.
3. No **SQL Editor**, execute:
   ```sql
   insert into public.admins (user_id, email, name)
   values ('COLE-O-UID-AQUI', 'toninho@toninhoimoveis.com.br', 'Toninho');
   ```

Depois disso, acesse `/admin/login`. Os próximos administradores podem ser criados pelo próprio painel, em **Usuários**.

---

## 🚀 Como publicar na Vercel

1. Acesse <https://vercel.com>, entre com a conta do GitHub e clique em **Add New → Project**.
2. Importe o repositório **`theuzxl13-oss/imobiliaria`**. A Vercel detecta Next.js automaticamente, sem nenhuma configuração extra.
3. Em **Environment Variables**, cadastre:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (ex.: `https://imobiliaria.vercel.app` até ter o domínio próprio)
4. Clique em **Deploy**.
5. Acesse `https://SEU-PROJETO.vercel.app/admin/login`, entre e confira tudo.

A cada `git push` na branch principal, a Vercel publica a nova versão automaticamente.

> Ao alterar variáveis de ambiente na Vercel, faça um **Redeploy** para aplicá-las.

---

## 🌐 Como configurar o domínio

1. Na Vercel: **Project → Settings → Domains → Add** e digite `toninhoimoveis.com.br` (adicione também `www.toninhoimoveis.com.br`, redirecionando um para o outro).
2. No registro do domínio (ex.: Registro.br), configure o DNS conforme a Vercel indicar, normalmente:
   | Tipo | Nome | Valor |
   |---|---|---|
   | `A` | `@` | `76.76.21.21` |
   | `CNAME` | `www` | `cname.vercel-dns.com` |
   > Use exatamente os valores exibidos pela Vercel, que podem mudar.
3. Aguarde a propagação (minutos a algumas horas). O HTTPS é ativado automaticamente.
4. Atualize a variável `NEXT_PUBLIC_SITE_URL` para o domínio oficial e faça **Redeploy**.
5. No Supabase, atualize **Authentication → URL Configuration → Site URL** para o domínio oficial.
6. Opcional: cadastre o site no [Google Search Console](https://search.google.com/search-console) e envie `https://SEU-DOMINIO/sitemap.xml`.

---

## 🛠 Manutenção

- **Imóveis de demonstração:** exclua-os em **Gerenciar imóveis** (busque por "Cidade Modelo") e preencha os dados reais em **Configurações** (WhatsApp, telefone, endereço etc.).
- **Atualizar o site:** faça as alterações, rode `npm run lint && npm run typecheck && npm run build` e envie para o GitHub. A Vercel publica sozinha. O GitHub Actions (`.github/workflows/ci.yml`) também verifica cada envio.
- **Novas alterações no banco:** crie um novo arquivo em `supabase/migrations/` (ex.: `20270101000000_nova_coluna.sql`) e aplique-o no SQL Editor ou com `npx supabase db push`. Nunca edite migrações já aplicadas.
- **Backup:** o Supabase faz backups diários (veja **Database → Backups**). Para uma cópia manual: `npx supabase db dump -f backup.sql`.
- **Fotos:** ficam no bucket `imoveis` (pasta `properties/<id-do-imóvel>`). Ao excluir uma foto ou um imóvel pelo painel, os arquivos também são removidos.
- **Senha de administrador esquecida:** outro administrador pode recriar o usuário em **Usuários**, ou altere a senha em Supabase → **Authentication → Users**.
- **Dependências:** atualize periodicamente com `npm outdated` / `npm update`, testando com `npm run build`.
- **Limites dos planos gratuitos:** Supabase Free (500 MB de banco, 1 GB de arquivos) e Vercel Hobby atendem bem o início. A otimização de imagens da Vercel tem cota mensal no plano gratuito; se for ultrapassada, considere o plano Pro.
- **Cache:** as páginas públicas são atualizadas na hora em que algo é salvo no painel e, além disso, revalidadas a cada 60 segundos.

---

## 🔒 Segurança

- Nenhuma senha, token ou chave está no código. Tudo vem de variáveis de ambiente (`.env.local` é ignorado pelo Git).
- A chave `service_role` é usada apenas no servidor (nunca chega ao navegador).
- Row Level Security em todas as tabelas: o site público só acessa o necessário.
- Toda Server Action administrativa verifica se o usuário está logado **e** é administrador. O banco verifica de novo pelas regras RLS.
- Cadastro público de usuários desativado. Apenas administradores criam contas.
- Formulários públicos com validação no servidor, limites de tamanho e campo anti-robô (honeypot).
- Cabeçalhos de segurança HTTP (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- O painel não é indexado por buscadores (`robots.txt` + `noindex`).

---

Desenvolvido para a **Toninho Imóveis**. Imagens dos imóveis de demonstração: [Unsplash](https://unsplash.com) (meramente ilustrativas).

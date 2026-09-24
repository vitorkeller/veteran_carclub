# Veteran Carclub

Plataforma web para divulgação de encontros de carros antigos e registro histórico dos veículos e veiculos que já participaram do clube.

Projeto da disciplina **Projeto de Aprendizagem Colaborativa Extensionista (PAC VI)**.

## Integrantes

- Vitor Arthur Keller — @vitorkeller
- Lucas Camilo Moraes — @hub-Moraes

## Stack tecnológica

| Camada         | Tecnologia                                                                           |
| -------------- | ------------------------------------------------------------------------------------ |
| Frontend       | Next.js (React + TypeScript)                                                         |
| Backend        | Node.js + Express                                                                    |
| Banco de dados | PostgreSQL (Supabase)                                                                |
| Armazenamento  | Supabase Storage                                                                     |
| Testes         | Vitest + Supertest (backend); Vitest + React Testing Library + Playwright (frontend) |
| CI/CD          | GitHub Actions                                                                       |
| Hospedagem     | Vercel (frontend) + Render (backend)                                                 |

Veja também [`rotas.md`](./docs/rotas.md) para a lista completa de páginas do frontend e endpoints da API, e [`database.md`](./docs/database.md) para o diagrama do banco de dados.

## Setup — ambiente de desenvolvimento

### Pré-requisitos

- **Node.js 20.6 ou superior** (confira com `node -v`; o CI roda em Node 22)
- **Uma conta no [Supabase](https://supabase.com)** (grátis) — obrigatória para o Storage, ver passo 2.
- **PostgreSQL** instalado e rodando localmente (14+) — necessário mesmo se você usar o banco do Supabase pra desenvolver (Opção A do passo 3), pois os testes automatizados rodam contra um Postgres local dedicado (ver [Testes](#testes))
- **npm** (vem junto com o Node.js)

### 1. Clonar e instalar as dependências

```bash
git clone https://github.com/vitorkeller/veteran_carclub.git
cd veteran_carclub
npm install
```

O projeto é um monorepo com **npm workspaces**: esse único `npm install` na raiz já instala as dependências do frontend (`packages/frontend`) e do backend (`packages/backend`).

### 2. Criar o projeto no Supabase

O backend usa o Supabase para o **Storage** (upload de fotos e documentos — obrigatório, sem ele o servidor nem sobe) e, opcionalmente, para o **banco de dados** (ver passo 3).

1. Crie uma conta e um projeto em [supabase.com/dashboard](https://supabase.com/dashboard) (região mais próxima, ex. South America).
2. **Storage:** menu lateral → **Storage** → **New bucket** → crie um bucket (ex. `uploads`) e marque **Public bucket**. Sem isso, as URLs dos arquivos não abrem no navegador.
3. **Project Settings → API**: copie a **Project URL** e a chave **`service_role`** (formato novo `sb_secret_...`; nunca a `anon`/pública, e nunca commitada).
4. Guarde os três valores — vão em `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_STORAGE_BUCKET` no passo 4.

### 3. Configurar o banco de dados

**Opção A — Postgres do Supabase (usado em produção):**

Em **Project Settings → Database → Connection string**, aba **Transaction pooler** (porta `6543`), copie a URL e troque `[YOUR-PASSWORD]` pela senha definida na criação do projeto. Vai em `DATABASE_URL` no passo 4.

> Use o pooler (`6543`), não a conexão direta (`5432`) — o backend hospedado abre e fecha conexões com mais frequência do que um Postgres local, e o pooler (PgBouncer) lida melhor com isso.

**Opção B — PostgreSQL local (recomendado pro dia a dia — mais rápido e não arrisca dado do banco compartilhado):**

Entre no `psql` (ajuste conforme sua instalação):

**Linux/macOS:**

```bash
sudo -u postgres psql
```

**Windows:**

```powershell
psql -U postgres
```

E crie um usuário e um banco dedicados ao projeto:

```sql
CREATE USER veteran_carclub WITH PASSWORD 'veteran_carclub';
CREATE DATABASE veteran_carclub OWNER veteran_carclub;
\q
```

> Já tem um PostgreSQL configurado de outro jeito (outro usuário, senha ou porta)? Sem problema — só ajuste a `DATABASE_URL` no passo seguinte.

**De qualquer forma, crie também o banco de testes** (usado por `npm test`, isolado do seu banco de desenvolvimento — ver [Testes](#testes)):

```bash
sudo -u postgres psql -c "CREATE DATABASE veteran_carclub_test OWNER veteran_carclub;"
```

### 4. Configurar as variáveis de ambiente do backend

**Linux/macOS:**

```bash
cp packages/backend/.env.example packages/backend/.env
```

**Windows:**

```powershell
copy packages\backend\.env.example packages\backend\.env
```

Abra `packages/backend/.env` e preencha `DATABASE_URL` (com a URL do passo 3) e `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_STORAGE_BUCKET` (com os valores do passo 2). A tabela completa está [mais abaixo](#variáveis-de-ambiente). Não mexa em `packages/backend/.env.test` — já vem pronto e versionado (ver [Testes](#testes)).

### 5. Criar o schema do banco

```bash
npm run db:migrar
```

Isso roda as migrações em `packages/backend/src/db.js` e cria todas as tabelas (`usuarios`, `eventos`, `veiculos`, `veiculo_imagens`, `inscricoes`, `historias`, `galeria_eventos`, `contatos`). Deve imprimir `schema criado`.

### 6. Criar o primeiro administrador

Por regra de negócio, administradores **não se cadastram pelo site** — eles são pré-cadastrados direto no banco. Use o script dedicado:

```bash
npm run db:criar-admin -- "Seu Nome" seu@email.com "uma-senha-forte"
```

Guarde esse e-mail/senha: é com eles que você vai entrar em `http://localhost:3000/admin/login` depois que o frontend estiver no ar.

### 7. Subir backend e frontend

Com um único comando, os dois sobem juntos (backend na porta `3001`, frontend na porta `3000`):

```bash
npm run dev
```

Prefere dois terminais separados (mais fácil de ler os logs de cada um)?

```bash
# terminal 1
npm run dev:backend

# terminal 2
npm run dev:frontend
```

### 8. Conferir que está tudo no ar

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend (health check): [http://localhost:3001/api/saude](http://localhost:3001/api/saude) → deve responder `{"ok":true}`
- Painel administrativo: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

As páginas públicas (Home, Agenda, Acervo, Histórias) **não usam dados de exemplo**: elas mostram exatamente o que estiver no banco. Assim que o admin cadastra um evento, uma história ou publica um veículo no acervo, a mudança aparece imediatamente nessas páginas (elas buscam os dados a cada acesso, sem cache).

Para ver o site com conteúdo, cadastre pelo menos um evento em
`/admin/eventos` depois de logar como admin.

## Testes

| Comando                                 | O que roda                                                                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test -w packages/backend`      | Testes de integração do backend (Vitest + Supertest), contra o Postgres **local** de teste (`veteran_carclub_test` — nunca o do Supabase)               |
| `npm run test -w packages/frontend`     | Testes de componente do frontend (Vitest + React Testing Library)                                                                                       |
| `npm run test:e2e -w packages/frontend` | Testes end-to-end (Playwright) — exige backend **e** frontend já rodando (ver `.github/workflows/ci-cd.yml` pra o passo a passo de subir os dois antes) |

O backend usa `packages/backend/.env.test` (versionado, sem segredo real) em vez do seu `.env` — assim `npm test` nunca corre o risco de rodar `TRUNCATE` no banco de desenvolvimento ou no do Supabase.

## Variáveis de ambiente

| Variável                                                         | Descrição                                                                                                                                                                                                       | Onde é usada                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`                                                   | String de conexão do PostgreSQL — local (dev) ou do Supabase (produção, connection string do Transaction pooler, porta `6543`)                                                                                  | Dev local e Render                                      |
| `PORT`                                                           | Porta em que a API do backend sobe                                                                                                                                                                              | Dev local (Render define a sua própria automaticamente) |
| `JWT_SECRET`                                                     | Segredo usado para assinar os tokens de login. **Precisa ser um valor diferente e aleatório em produção** (ex.: `openssl rand -hex 32`)                                                                         | Dev local e Render                                      |
| `JWT_EXPIRACAO`                                                  | Validade do token de login (ex. `7d`)                                                                                                                                                                           | Dev local e Render                                      |
| `SUPABASE_URL`                                                   | URL do projeto Supabase. **Obrigatória** — sem ela o servidor não sobe                                                                                                                                          | Dev local e Render                                      |
| `SUPABASE_SERVICE_ROLE_KEY`                                      | Chave de acesso total do Supabase (formato `sb_secret_...`), usada só no backend pra gravar no Storage. **Obrigatória**, nunca exposta ao frontend                                                              | Dev local e Render                                      |
| `SUPABASE_STORAGE_BUCKET`                                        | Nome do bucket público do Supabase Storage onde ficam as fotos e documentos enviados                                                                                                                            | Dev local e Render                                      |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Credenciais SMTP para envio de e-mails (confirmação, aprovação/reprovação, código de check-in). Opcionais — sem elas, os e-mails só são registrados no console ("modo simulação"). Passo a passo em `rotas.md`. | Dev local e Render (opcional nos dois)                  |

Todas as variáveis do backend acima ficam em `packages/backend/.env` localmente (a partir do `.env.example`) e são cadastradas direto no painel do Render em produção — nenhuma delas é um Secret do GitHub Actions (ver [Deploy e CI/CD](#deploy-e-cicd)).

Arquivos enviados (fotos, documentos) vão para o **Supabase Storage** (`services/armazenamento.js`) — não existe mais armazenamento em disco local.

O frontend lê uma única variável, em `packages/frontend/.env.local` (dev) ou nas Environment Variables do projeto na Vercel (produção):

| Variável              | Descrição                                                                                                                                                                 | Onde é usada                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da API consumida pelo site. Localmente cai para `http://localhost:3001` se não for definida; em produção precisa apontar para a URL pública do backend no Render | Dev local (opcional) e Vercel (obrigatória) |

> `NEXT_PUBLIC_*` é convenção do Next.js: essas variáveis vão embutidas no código que roda no navegador, então nunca coloque segredo nelas (não é o caso aqui, é só uma URL pública).

## Scripts disponíveis (raiz do monorepo)

| Comando                  | O que faz                                                                       |
| ------------------------ | ------------------------------------------------------------------------------- |
| `npm run dev`            | Sobe backend + frontend juntos (um único terminal, logs coloridos)              |
| `npm run dev:backend`    | Sobe só o backend, com reload automático (`node --watch`)                       |
| `npm run dev:frontend`   | Sobe só o frontend (Next.js dev server)                                         |
| `npm run start:backend`  | Sobe o backend em modo produção (sem watch) — o mesmo comando que a Render roda |
| `npm run test:backend`   | Testes de integração do backend (Vitest + Supertest + Postgres local de teste)  |
| `npm run test:frontend`  | Testes de componente do frontend (Vitest + React Testing Library)               |
| `npm run db:migrar`      | Cria/atualiza o schema do PostgreSQL                                            |
| `npm run db:criar-admin` | Pré-cadastra um administrador direto no banco                                   |

## Arquitetura resumida

Monorepo com `packages/frontend` (Next.js, App Router) e `packages/backend` (Express) organizados via **npm workspaces**.

**Backend**: organizado em camadas por domínio dentro de `src/modules/<dominio>/` — cada módulo (`usuarios`, `eventos`, `veiculos`, `inscricoes`, `historias`, `contato`, `instagram`, `uploads`) segue o mesmo padrão de três arquivos:

- `*.repositorio.js` — a única camada que sabe escrever SQL / falar com o `pg`
- `*.servico.js` — regras de negócio e validação (usando `zod`)
- `*.rotas.js` — mapeia HTTP para as funções do serviço

`src/db.js` centraliza a conexão com o PostgreSQL e expõe `query()` e `transacao()`. Regras de negócio críticas são garantidas com `UNIQUE`/`CHECK` no próprio banco (1 evento por dia, capacidade máxima de 600 por evento), não só na aplicação. Limites que evoluem com mais frequência (até 10 fotos por veículo, até 50 por evento) ficam na camada de serviço.

**Frontend**: App Router do Next.js. Páginas públicas (`/`, `/agenda`, `/agenda/[id]`, `/acervo`, `/historias`, `/inscricao`) são Server Components que buscam dados direto da API com `cache: "no-store"` — sempre a versão mais recente, sem o atraso de um cache de fetch do Next.js ficando desatualizado depois que o admin cadastra algo. O painel administrativo (`/admin/**`) é protegido por uma sessão JWT guardada no navegador (`useSyncExternalStore`, sem `useState`+`useEffect`) — veja `rotas.md` para o detalhe de cada rota.

## Deploy e CI/CD

Repositório no GitHub, com um único workflow (`.github/workflows/ci-cd.yml`) cuidando de teste e deploy.

### Como o pipeline funciona

**Gatilhos:** todo `push` ou `pull request` para as branches `main` e `dev` disparam o workflow.

**Jobs de teste (rodam sempre, nas duas branches e em PRs):**

1. `test-backend` — sobe um Postgres 16 descartável como serviço do próprio GitHub Actions e roda `npm run test -w packages/backend` contra ele. Não toca no Supabase.
2. `test-frontend` — roda `npm run lint` e `npm run test -w packages/frontend` (não precisa de banco).
3. `e2e` — depende dos dois anteriores. Sobe outro Postgres descartável, copia `packages/backend/.env.test` para `.env`, roda as migrações, cria um admin de teste, sobe o backend e o frontend em segundo plano, espera os dois responderem (`wait-on`) e roda `npm run test:e2e -w packages/frontend` (Playwright) contra eles.

**Deploy (só em push direto na `main`, e só se os três jobs acima passarem):**

4. `deploy-backend` — dispara um **Deploy Hook** da Render (uma URL fixa; um `curl -X POST` nela já manda a Render buscar o commit mais novo e reimplantar).
5. `deploy-frontend` — usa a Vercel CLI (`vercel pull` → `vercel build` → `vercel deploy --prebuilt --prod`) autenticada com um token.

Como o deploy só roda a partir da `main`, a branch `dev` (e qualquer PR) só passa pelos testes — dá pra integrar e revisar código sem nunca disparar um deploy de verdade.

### Vercel (frontend)

- Projeto linkado no **modo monorepo** (`.vercel/repo.json` na raiz do repositório, não um `.vercel/project.json` dentro de `packages/frontend`) — aponta pro `directory: packages/frontend`. Por isso os comandos da Vercel CLI no workflow rodam a partir da raiz do repositório, sem `working-directory`.
- **Auto-deploy do Git desligado** nas configurações do projeto (Settings → Git) — se estivesse ligado, a Vercel faria deploy sozinha a cada push, sem esperar os testes do GitHub Actions.
- Variável de ambiente `NEXT_PUBLIC_API_URL` cadastrada direto no painel da Vercel, apontando pra URL pública do backend na Render.

### Render (backend)

- **Root Directory** em branco (raiz do monorepo) — necessário porque o projeto usa npm workspaces; apontar pra `packages/backend` faria a Render não enxergar o resto do repositório e o `npm install` não resolveria as dependências.
- **Build Command:** `npm install` — **Start Command:** `npm run start:backend`.
- **Auto-Deploy desligado** (Settings → Auto-Deploy), pelo mesmo motivo da Vercel: quem decide quando implantar é o workflow do GitHub Actions, via Deploy Hook.
- Todas as variáveis da seção [Variáveis de ambiente](#variáveis-de-ambiente) cadastradas em Environment, direto no painel.

### Secrets do GitHub Actions

Cadastrados em Settings → Secrets and variables → Actions do repositório:

| Secret                   | Pra que serve                                     |
| ------------------------ | ------------------------------------------------- |
| `RENDER_DEPLOY_HOOK_URL` | Dispara o redeploy do backend na Render           |
| `VERCEL_TOKEN`           | Autentica a Vercel CLI no workflow                |
| `VERCEL_ORG_ID`          | Identifica o time/conta da Vercel dona do projeto |
| `VERCEL_PROJECT_ID`      | Identifica o projeto da Vercel a implantar        |

Nenhuma credencial do Supabase, `JWT_SECRET` ou SMTP é um Secret do GitHub — essas vivem só nos painéis da Render (backend em produção) e no `.env` local de cada um (dev), o CI usa suas próprias, falsas, só pra rodar os testes (ver [Testes](#testes)).

## Estrutura

```
veteran_carclub/
├── package.json                  # raiz do monorepo (workspaces)
├── README.md
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # testes + deploy condicional (Render/Vercel)
├── docs/
│   ├── rotas.md                  # documentação de todas as rotas
│   └── database.md               # diagrama ER (Mermaid) do banco de dados
└── packages/
    ├── backend/
    │   ├── package.json
    │   ├── .env.example
    │   ├── .env.test             # config de teste (versionado, sem segredo real)
    │   ├── vitest.config.js
    │   ├── src/
    │   │   ├── server.js         # entrypoint (npm start)
    │   │   ├── app.js            # monta os routers
    │   │   ├── db.js             # conexão + schema do PostgreSQL
    │   │   ├── config/           # variáveis de ambiente centralizadas + client do Supabase
    │   │   ├── middlewares/      # autenticação JWT, admin, upload (multer), erros
    │   │   ├── services/         # armazenamento (Supabase Storage), e-mail (SMTP/simulação) + templates
    │   │   ├── utils/            # senha (bcrypt), token (JWT), código de check-in, datas, ErroHttp
    │   │   ├── scripts/
    │   │   │   └── criar-admin.js
    │   │   └── modules/
    │   │       ├── usuarios/     # cadastro + inscrição no evento (1 ação atômica, sem senha), login (só admin), aprovação
    │   │       ├── eventos/      # CRUD (horário, capa, galeria até 50) + agenda + detalhe c/ participantes
    │   │       ├── veiculos/     # cadastro (até 10 fotos) + gestão de imagens + curadoria do acervo
    │   │       ├── inscricoes/   # inscrição com trava de capacidade (600) + listagem por evento (admin) + check-in
    │   │       ├── historias/    # CRUD vinculado a eventos + curadoria de veículos em destaque
    │   │       ├── contato/      # formulário de contato da Home
    │   │       ├── instagram/    # feed social da Home (dados mockados, sem integração externa)
    │   │       └── uploads/      # upload genérico de arquivos
    │   └── tests/                # Vitest + Supertest (integração, banco real de teste)
    └── frontend/
        ├── package.json
        ├── next.config.ts
        ├── vitest.config.ts
        ├── playwright.config.ts
        ├── tsconfig.json
        ├── public/
        ├── tests/                # Vitest + React Testing Library (componentes)
        ├── e2e/                  # Playwright (ponta a ponta, stack completa)
        └── src/
            ├── app/
            │   ├── layout.tsx           # fontes, metadata
            │   ├── page.tsx             # Home
            │   ├── agenda/
            │   │   ├── page.tsx
            │   │   └── [id]/page.tsx    # detalhe do evento (galeria, participantes, história)
            │   ├── acervo/page.tsx
            │   ├── historias/page.tsx
            │   ├── inscricao/page.tsx   # cadastro + inscrição (exige ?evento=, 2 fluxos + upload real)
            │   └── admin/
            │       ├── login/page.tsx
            │       └── (protegido)/     # layout com guarda de sessão + sidebar
            │           ├── page.tsx           # dashboard
            │           ├── usuarios/page.tsx  # Dashboard de Inscritos (por evento)
            │           ├── eventos/page.tsx   # criação/gestão + galeria/capa
            │           ├── historias/page.tsx # CRUD + curadoria de veículos em destaque
            │           └── veiculos/page.tsx  # curadoria do acervo
            ├── components/
            │   ├── layout/         # Navbar, Footer
            │   ├── home/           # Hero, EventsSection, SocialFeed, ContactSection, ...
            │   ├── eventos/        # EventoCard (compartilhado Home + Agenda)
            │   ├── veiculos/       # VeiculoCard, AcervoGaleria, VeiculoModal
            │   ├── historias/      # HistoriaCard
            │   ├── inscricao/      # InscricaoForm
            │   └── ui/             # Placa (assinatura visual), Modal, Carousel
            ├── lib/
            │   ├── api.ts          # fetchers públicos (sem cache, sem mock)
            │   ├── admin-auth.ts   # sessão JWT client-side + fetch autenticado
            │   ├── upload.ts       # helper de upload de arquivos
            │   └── formatadores.ts # formatação de data/horário/iniciais
            └── types/
                └── index.ts
```

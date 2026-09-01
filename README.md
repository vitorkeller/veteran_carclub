# Veteran Carclub

Plataforma web para divulgação de encontros de carros antigos e registro histórico dos veículos e veiculos que já participaram do clube.

Projeto da disciplina **Projeto de Aprendizagem Colaborativa Extensionista (PAC VI)**.

## Integrantes

- Vitor Arthur Keller — @vitorkeller
- Lucas Camilo Moraes — @hub-Moraes

## Stack tecnológica

| Camada         | Tecnologia                   |
| -------------- | ---------------------------- |
| Frontend       | Next.js (React + TypeScript) |
| Backend        | Node.js + Express            |
| Banco de dados | PostgreSQL                   |

Veja também [`rotas.md`](./docs/rotas.md) para a lista completa de páginas do frontend e endpoints da API, e [`database.md`](./docs/database.md) para o diagrama do banco de dados.

## Setup — ambiente de desenvolvimento

### Pré-requisitos

- **Node.js 20.6 ou superior** (o backend usa `node --env-file`, disponível a partir dessa versão — confira com `node -v`)
- **PostgreSQL** instalado e rodando localmente (qualquer versão recente, 14+)
- **npm** (vem junto com o Node.js)

### 1. Clonar e instalar as dependências

```bash
git clone https://github.com/vitorkeller/veteran_carclub
cd veteran_carclub
npm install
```

O projeto é um monorepo com **npm workspaces**: esse único `npm install` na raiz já instala as dependências do frontend (`packages/frontend`) e do backend (`packages/backend`).

### 2. Criar o banco de dados PostgreSQL

Entre no `psql` (ajuste conforme sua instalação):

```bash
sudo -u postgres psql
```

E crie um usuário e um banco dedicados ao projeto:

```sql
CREATE USER veteran_carclub WITH PASSWORD 'veteran_carclub';
CREATE DATABASE veteran_carclub OWNER veteran_carclub;
\q
```

> Já tem um PostgreSQL configurado de outro jeito (outro usuário, senha ou porta)? Sem problema — só ajuste a `DATABASE_URL` no passo seguinte.

### 3. Configurar as variáveis de ambiente do backend

```bash
cp packages/backend/.env.example packages/backend/.env
```

Abra `packages/backend/.env` e confira os valores (a tabela completa está [mais abaixo](#variáveis-de-ambiente)). Os padrões já batem com o banco criado no passo 2.

### 4. Criar o schema do banco

```bash
npm run db:migrar
```

Isso roda as migrações em `packages/backend/src/db.js` e cria todas as tabelas (`usuarios`, `eventos`, `veiculos`, `veiculo_imagens`, `inscricoes`, `historias`, `galeria_eventos`, `contatos`). Deve imprimir `schema criado`.

### 5. Criar o primeiro administrador

Por regra de negócio, administradores **não se cadastram pelo site** — eles são pré-cadastrados direto no banco. Use o script dedicado:

```bash
npm run db:criar-admin -- "Seu Nome" seu@email.com "uma-senha-forte"
```

Guarde esse e-mail/senha: é com eles que você vai entrar em `http://localhost:3000/admin/login` depois que o frontend estiver no ar.

### 6. Subir backend e frontend

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

### 7. Conferir que está tudo no ar

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend (health check): [http://localhost:3001/api/saude](http://localhost:3001/api/saude) → deve responder `{"ok":true}`
- Painel administrativo: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

As páginas públicas (Home, Agenda, Acervo, Histórias) **não usam dados de exemplo**: elas mostram exatamente o que estiver no banco. Assim que o admin cadastra um evento, uma história ou publica um veículo no acervo, a mudança aparece imediatamente nessas páginas (elas buscam os dados a cada acesso, sem cache).

Para ver o site com conteúdo, cadastre pelo menos um evento em
`/admin/eventos` depois de logar como admin.

## Variáveis de ambiente

Definidas em `packages/backend/.env` (o `.env.example` já traz os padrões de
desenvolvimento):

| Variável                                                         | Descrição                                                                                                                                                                                                       | Padrão local                                                                |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`                                                   | String de conexão do PostgreSQL                                                                                                                                                                                 | `postgres://veteran_carclub:veteran_carclub@localhost:5432/veteran_carclub` |
| `PORT`                                                           | Porta em que a API do backend sobe                                                                                                                                                                              | `3001`                                                                      |
| `JWT_SECRET`                                                     | Segredo usado para assinar os tokens de login. **Troque em produção** (ex.: `openssl rand -hex 32`)                                                                                                             | `troque-este-valor-em-producao`                                             |
| `JWT_EXPIRACAO`                                                  | Validade do token de login                                                                                                                                                                                      | `7d`                                                                        |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Credenciais SMTP para envio de e-mails (confirmação, aprovação/reprovação, código de check-in). Opcionais — sem elas, os e-mails só são registrados no console ("modo simulação"). Passo a passo em `rotas.md`. | _(vazio, exceto `SMTP_PORT=587`)_                                           |

Arquivos enviados (fotos, documentos) ficam em `packages/backend/uploads/` (`services/armazenamento.js`, criada automaticamente, ignorada pelo git) — ok para o escopo atual do projeto.

O frontend lê uma única variável opcional, em `packages/frontend/.env.local` (crie o arquivo se precisar mudar o padrão):

| Variável              | Descrição                           | Padrão                  |
| --------------------- | ----------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da API consumida pelo site | `http://localhost:3001` |

## Scripts disponíveis (raiz do monorepo)

| Comando                  | O que faz                                                          |
| ------------------------ | ------------------------------------------------------------------ |
| `npm run dev`            | Sobe backend + frontend juntos (um único terminal, logs coloridos) |
| `npm run dev:backend`    | Sobe só o backend, com reload automático (`node --watch`)          |
| `npm run dev:frontend`   | Sobe só o frontend (Next.js dev server)                            |
| `npm run start:backend`  | Sobe o backend em modo produção (sem watch)                        |
| `npm run test:backend`   | Roda a suíte de testes do backend (Vitest)                         |
| `npm run db:migrar`      | Cria/atualiza o schema do PostgreSQL                               |
| `npm run db:criar-admin` | Pré-cadastra um administrador direto no banco                      |

## Arquitetura resumida

Monorepo com `packages/frontend` (Next.js, App Router) e `packages/backend` (Express) organizados via **npm workspaces**.

**Backend**: organizado em camadas por domínio dentro de `src/modules/<dominio>/` — cada módulo (`usuarios`, `eventos`, `veiculos`, `inscricoes`, `historias`, `contato`, `instagram`, `uploads`) segue o mesmo padrão de três arquivos:

- `*.repositorio.js` — a única camada que sabe escrever SQL / falar com o `pg`
- `*.servico.js` — regras de negócio e validação (usando `zod`)
- `*.rotas.js` — mapeia HTTP para as funções do serviço

`src/db.js` centraliza a conexão com o PostgreSQL e expõe `query()` e `transacao()`. Regras de negócio críticas são garantidas com `UNIQUE`/`CHECK` no próprio banco (1 evento por dia, capacidade máxima de 600 por evento), não só na aplicação. Limites que evoluem com mais frequência (até 10 fotos por veículo, até 50 por evento) ficam na camada de serviço.

**Frontend**: App Router do Next.js. Páginas públicas (`/`, `/agenda`, `/agenda/[id]`, `/acervo`, `/historias`, `/inscricao`) são Server Components que buscam dados direto da API com `cache: "no-store"` — sempre a versão mais recente, sem o atraso de um cache de fetch do Next.js ficando desatualizado depois que o admin cadastra algo. O painel administrativo (`/admin/**`) é protegido por uma sessão JWT guardada no navegador (`useSyncExternalStore`, sem `useState`+`useEffect`) — veja `rotas.md` para o detalhe de cada rota.

## Estrutura

```
veteran_carclub/
├── package.json                  # raiz do monorepo (workspaces)
├── README.md
├── docs/
│   ├── rotas.md                  # documentação de todas as rotas
│   └── database.md               # diagrama ER (Mermaid) do banco de dados
└── packages/
    ├── backend/
    │   ├── package.json
    │   ├── .env.example
    │   ├── uploads/              # arquivos enviados (fotos, documentos) — gitignored
    │   ├── src/
    │   │   ├── server.js         # entrypoint (npm start)
    │   │   ├── app.js            # monta os routers + serve /uploads estático
    │   │   ├── db.js             # conexão + schema do PostgreSQL
    │   │   ├── config/           # variáveis de ambiente centralizadas
    │   │   ├── middlewares/      # autenticação JWT, admin, upload (multer), erros
    │   │   ├── services/         # armazenamento (disco local), e-mail (SMTP/simulação) + templates
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
    │   └── tests/
    └── frontend/
        ├── package.json
        ├── next.config.ts
        ├── tsconfig.json
        ├── public/
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
            │   ├── layout/        # Navbar, Footer
            │   ├── home/          # Hero, EventsSection, SocialFeed, ContactSection, ...
            │   ├── eventos/       # EventoCard (compartilhado Home + Agenda)
            │   ├── veiculos/      # VeiculoCard, AcervoGaleria, VeiculoModal
            │   ├── historias/     # HistoriaCard
            │   ├── inscricao/     # InscricaoForm
            │   └── ui/            # Placa (assinatura visual), Modal, Carousel
            ├── lib/
            │   ├── api.ts          # fetchers públicos (sem cache, sem mock)
            │   ├── admin-auth.ts   # sessão JWT client-side + fetch autenticado
            │   ├── upload.ts       # helper de upload de arquivos
            │   └── formatadores.ts # formatação de data/horário/iniciais
            └── types/
                └── index.ts
```

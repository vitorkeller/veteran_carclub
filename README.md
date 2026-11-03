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
| Banco de dados | PostgreSQL (Supabase em produção; container local em desenvolvimento)                |
| Armazenamento  | Supabase Storage                                                                     |
| Testes         | Vitest + Supertest (backend); Vitest + React Testing Library + Playwright (frontend) |
| Ambiente local | Docker + Docker Compose                                                              |
| CI/CD          | GitHub Actions                                                                       |
| Hospedagem     | Vercel (frontend) + Render (backend)                                                 |

Veja também [`rotas.md`](./docs/rotas.md) para a lista completa de páginas do frontend e endpoints da API, e [`database.md`](./docs/database.md) para o diagrama do banco de dados.

---

## Início rápido com Docker (recomendado)

Com Docker você **não precisa instalar Node.js nem PostgreSQL**: banco, backend e frontend sobem juntos, com as mesmas versões para todo o grupo (Node 22, PostgreSQL 16).

### Pré-requisitos

- **Docker com Compose v2** — confira com `docker compose version` (o comando é `docker compose`, com espaço, e não `docker-compose`).
  - **Windows:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) com **WSL 2** ativado e a integração com a sua distribuição ligada (Settings → Resources → WSL Integration).
  - **Linux/macOS:** Docker Engine ou Docker Desktop.
- **Git**.
- **Uma conta no [Supabase](https://supabase.com)** (grátis) — o backend usa o Storage para as fotos e documentos e **não sobe sem as chaves** (passo 2).

> **Usuários de WSL:** clone o repositório **dentro do sistema de arquivos do Linux** (ex.: `~/projetos/`), nunca em `/mnt/c/...`. Em `/mnt/c` o hot reload não detecta as alterações e tudo fica muito mais lento.

### 1. Clonar o repositório

```bash
git clone https://github.com/vitorkeller/veteran_carclub.git
cd veteran_carclub
```

### 2. Criar o projeto no Supabase

1. Crie uma conta e um projeto em [supabase.com/dashboard](https://supabase.com/dashboard) (região mais próxima, ex.: South America).
2. **Storage:** menu lateral → **Storage** → **New bucket** → crie um bucket chamado `uploads` e marque **Public bucket**. Sem isso, as URLs dos arquivos não abrem no navegador.
3. **Project Settings → API:** copie a **Project URL** e a chave **`service_role`** (formato `sb_secret_...`). Nunca use a chave `anon`/pública, e nunca faça commit da `service_role`.

> Só quer ver o site funcionando e não tem o Supabase à mão? Dá para subir tudo com valores fictícios (os mesmos de `packages/backend/.env.test`), mas **qualquer upload de arquivo vai falhar**.

### 3. Configurar as variáveis de ambiente

```bash
cp packages/backend/.env.example packages/backend/.env
```

Abra `packages/backend/.env` e preencha **apenas estas três**:

| Variável                    | O que colocar                                                       |
| --------------------------- | ------------------------------------------------------------------- |
| `SUPABASE_URL`              | Project URL copiada no passo 2                                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` (`sb_secret_...`) copiada no passo 2           |
| `SUPABASE_STORAGE_BUCKET`   | Nome do bucket criado (`uploads`, se você seguiu o passo 2)         |

Opcional: troque `JWT_SECRET` por um valor aleatório (`openssl rand -hex 32`). O frontend **não precisa** de arquivo `.env`.

> No Docker, `DATABASE_URL` e `PORT` do `.env` são **ignoradas**: o `docker-compose.yml` aponta o backend para o banco do container (`db`) e fixa a porta `3001`. O restante do arquivo (Supabase, JWT, SMTP) é usado normalmente.

### 4. Subir o ambiente

```bash
docker compose up --build
```

Na primeira vez isso baixa as imagens e instala as dependências (alguns minutos). Quando o log mostrar `Veteran Car Club API rodando...` e o `Ready` do Next.js, está no ar. As migrações do banco rodam sozinhas na subida do backend — não existe passo de `db:migrar` no Docker.

Prefere liberar o terminal? Use `docker compose up --build -d` e acompanhe com `docker compose logs -f`.

### 5. Criar o primeiro administrador

Por regra de negócio, administradores **não se cadastram pelo site** — são pré-cadastrados direto no banco. Com o ambiente no ar, em outro terminal:

```bash
docker compose exec backend node src/scripts/criar-admin.js "Seu Nome" seu@email.com "uma-senha-forte"
```

Guarde esse e-mail e senha: são eles que entram em `/admin/login`.

### 6. Conferir que está tudo no ar

- Frontend: <http://localhost:3000>
- API (health check): <http://localhost:3001/api/saude> → deve responder `{"ok":true}`
- Painel administrativo: <http://localhost:3000/admin/login>
- Banco (opcional, para DBeaver/psql): `localhost`, porta **5433**, usuário/senha/banco `veteran_carclub`

As páginas públicas (Home, Agenda, Acervo, Histórias) **não usam dados de exemplo**: mostram exatamente o que estiver no banco. Cadastre pelo menos um evento em `/admin/eventos` depois de entrar como admin.

### Comandos do dia a dia

| Comando                                                | O que faz                                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `docker compose up -d`                                 | Sobe o ambiente em segundo plano                                                  |
| `docker compose logs -f backend`                       | Acompanha os logs de um serviço (`backend`, `frontend` ou `db`)                   |
| `docker compose stop`                                  | Pausa tudo (os dados do banco são mantidos)                                       |
| `docker compose down`                                  | Remove os containers (os dados do banco são mantidos)                             |
| `docker compose down -v`                               | **Apaga também o banco de dados** (volume). Use para recomeçar do zero            |
| `docker compose up --build`                            | Reconstrói as imagens — **necessário** ao mudar `package.json`, `package-lock.json` ou arquivos de configuração (`next.config.ts`, `tsconfig.json`, etc.) |
| `docker compose exec backend sh`                       | Abre um terminal dentro do container do backend                                   |
| `docker compose exec db psql -U veteran_carclub veteran_carclub` | Abre o `psql` no banco de desenvolvimento                               |

Editar o código-fonte (`packages/*/src`, `public`, `tests`) **não exige reiniciar nada**: o backend reinicia sozinho (`node --watch`) e o Next.js atualiza a página (hot reload).

> **Adicionar uma dependência nova:** rode `npm install <pacote> -w packages/backend` (ou `-w packages/frontend`) no seu computador — isso exige Node.js 20.6+ instalado — para atualizar `package.json` e `package-lock.json`, e depois `docker compose up --build`.

### Como o ambiente está montado

| Serviço    | Imagem / origem               | Porta no seu computador | Função                                                                    |
| ---------- | ----------------------------- | ----------------------- | ------------------------------------------------------------------------- |
| `db`       | `postgres:16-alpine`          | `5433`                  | Banco de desenvolvimento (`veteran_carclub`) e de testes (`veteran_carclub_test`) |
| `backend`  | `Dockerfile` (target `backend`)  | `3001`               | API Express com reload automático                                         |
| `frontend` | `Dockerfile` (target `frontend`) | `3000`               | Next.js em modo desenvolvimento                                           |

Pontos que costumam causar confusão:

- **Dois endereços para a mesma API.** O navegador usa `NEXT_PUBLIC_API_URL=http://localhost:3001`; o servidor do Next (dentro do container) usa `API_URL_INTERNA=http://backend:3001`. Ambos já estão definidos no `docker-compose.yml`.
- **Dois bancos no mesmo PostgreSQL.** `veteran_carclub` (dev) e `veteran_carclub_test` (testes, criado automaticamente na primeira subida). Os testes **nunca** tocam no de desenvolvimento nem no do Supabase.
- **Banco local, Storage na nuvem.** Os dados de dev ficam no container; os arquivos enviados vão para o seu bucket do Supabase.

---

## Testes

### Com Docker

| Comando                                                              | O que roda                                                                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `docker compose run --rm backend-test`                               | Testes de integração do backend (Vitest + Supertest) contra `veteran_carclub_test`                                  |
| `docker compose run --rm --no-deps frontend npm test`                | Testes de componente do frontend (Vitest + React Testing Library) — não precisa do ambiente no ar                   |
| `docker compose run --rm --no-deps frontend npm run lint`            | ESLint do frontend                                                                                                 |

Para rodar um único arquivo de teste do backend: `docker compose run --rm backend-test npm test -- tests/senha.test.js`.

**E2E, performance e carga** usam uma pilha própria e isolada (perfil `e2e`): API + banco de teste + frontend em **build de produção** + Playwright com Chromium. Nada disso mexe no seu ambiente de desenvolvimento.

```bash
# 1) Construir as imagens (refaça quando o código mudar)
docker compose --profile e2e build

# 2) E2E (Playwright)
docker compose --profile e2e run --rm playwright

# 3) Performance do frontend (Web Vitals e sessões simultâneas)
docker compose --profile e2e run --rm playwright npm run test:perf

# 4) Microbenchmarks + teste de carga do backend
docker compose --profile e2e run --rm carga

# 5) Desligar a pilha de testes
docker compose --profile e2e down
```

> O teste de carga limpa o banco de teste (inclusive o admin criado para o E2E). Para rodar o E2E de novo depois dele, recrie o admin com `docker compose --profile e2e restart api-e2e`.
>
> Os limites de tempo (p95, LCP, TTFB) são generosos e configuráveis por variável de ambiente (`CARGA_CONCORRENCIA`, `CARGA_TOTAL`, `CARGA_P95_INSCRICAO_MS`, `CARGA_P95_LEITURA_MS`, `CARGA_SESSOES`, `CARGA_SESSOES_MAX_MS`). Medições dentro do Docker Desktop variam bastante — use-as para detectar regressões, não como números absolutos.

> **Nunca** rode `npm test` dentro do container `backend` (de desenvolvimento). Use sempre `backend-test`. Como proteção, `limparBanco()` recusa-se a apagar qualquer banco cujo nome não termine em `_test`.

### Sem Docker

| Comando                                 | O que roda                                                                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test -w packages/backend`      | Testes de integração do backend, contra o Postgres **local** de teste (`veteran_carclub_test` — nunca o do Supabase)                                    |
| `npm run test -w packages/frontend`     | Testes de componente do frontend                                                                                                                        |
| `npm run test:e2e -w packages/frontend` | E2E (Playwright) — exige backend **e** frontend já rodando e um admin `admin-e2e@teste.com` / `senha-e2e-123` (ver `.github/workflows/ci-cd.yml`)       |
| `npm run bench -w packages/backend`     | Microbenchmarks (Vitest bench) de bcrypt, JWT e código de check-in                                                                                      |
| `npm run test:load -w packages/backend` | Teste de carga da API — exige o backend rodando contra o banco de **teste**                                                                             |
| `npm run test:perf -w packages/frontend`| Performance do frontend (Playwright) — use o frontend em modo produção (`npm run build && npm run start`)                                               |

O backend usa `packages/backend/.env.test` (versionado, sem segredo real) em vez do seu `.env` — assim `npm test` nunca roda `TRUNCATE` no banco de desenvolvimento ou no do Supabase.

---

## Solução de problemas

| Sintoma                                                                                   | Causa e solução                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `env file .../packages/backend/.env not found`                                            | Faltou o passo 3: `cp packages/backend/.env.example packages/backend/.env`.                                                                                                                  |
| Backend sai com `Variável de ambiente obrigatória não definida: SUPABASE_URL`             | O `.env` ainda está com as chaves do Supabase vazias. Preencha e rode `docker compose up -d --force-recreate backend`.                                                                       |
| `port is already allocated` / `address already in use` (3000, 3001 ou 5433)               | Outro programa usa a porta. Feche-o ou troque o número da **esquerda** em `ports:` do `docker-compose.yml` (se mudar a 3001, ajuste também `NEXT_PUBLIC_API_URL` do `frontend`).            |
| Site mostra erro 500 / "API respondeu ..." / "fetch failed"                               | O backend não está saudável. Veja `docker compose logs backend`.                                                                                                                            |
| O frontend nunca sobe                                                                     | Ele espera o backend ficar saudável. Veja `docker compose logs backend` (quase sempre é o `.env`).                                                                                          |
| Editei o código e nada muda                                                               | O projeto está em `/mnt/c/...` (WSL). Mova-o para dentro do Linux (`~/`) e reclone. Se mudou `package.json` ou arquivos de configuração, use `docker compose up --build`.                     |
| Upload falha ou a imagem enviada não abre                                                 | No Supabase, o bucket precisa ser **público**, ter o mesmo nome de `SUPABASE_STORAGE_BUCKET`, e a chave deve ser a `service_role` (`sb_secret_...`).                                         |
| `database "veteran_carclub_test" does not exist`                                          | O volume do banco é anterior ao script de inicialização. Crie o banco: `docker compose exec db psql -U veteran_carclub -d postgres -c "CREATE DATABASE veteran_carclub_test OWNER veteran_carclub;"` — ou recomece com `docker compose down -v`. |
| `limparBanco() recusado: o banco "..." não parece ser de teste`                           | Os testes foram rodados contra um banco que não é de teste (a trava funcionou). Use `docker compose run --rm backend-test`.                                                                  |
| O build falha ao baixar a fonte "Work Sans" / Google Fonts                                | O build do Next.js precisa de internet para buscar a fonte. Verifique conexão/proxy e rode de novo.                                                                                         |
| `docker: 'compose' is not a docker command` / `docker-compose: command not found`         | Você tem o Compose v1 ou ele não está instalado. Atualize o Docker Desktop (ou instale o plugin `docker-compose-plugin`) e use `docker compose`.                                             |
| Quero recomeçar do zero                                                                   | `docker compose down -v && docker compose up --build` (apaga o banco de desenvolvimento).                                                                                                    |

---

## Alternativa: ambiente sem Docker

Use só se não puder instalar o Docker.

### Pré-requisitos

- **Node.js 20.6 ou superior** (confira com `node -v`; o CI roda em Node 22) e **npm**
- **PostgreSQL 14+** instalado e rodando localmente
- **Conta no Supabase**, com o bucket e as chaves do passo 2 do [Início rápido](#2-criar-o-projeto-no-supabase)

### Passo a passo

**1. Instalar as dependências** — o projeto é um monorepo com **npm workspaces**; um único `npm install` na raiz instala frontend e backend:

```bash
git clone https://github.com/vitorkeller/veteran_carclub.git
cd veteran_carclub
npm install
```

**2. Criar os bancos** (dev e testes) no `psql` (`sudo -u postgres psql` no Linux/macOS; `psql -U postgres` no Windows):

```sql
CREATE USER veteran_carclub WITH PASSWORD 'veteran_carclub';
CREATE DATABASE veteran_carclub OWNER veteran_carclub;
CREATE DATABASE veteran_carclub_test OWNER veteran_carclub;
\q
```

**3. Variáveis de ambiente** — copie o modelo e preencha `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_STORAGE_BUCKET`. A `DATABASE_URL` padrão já aponta para o banco criado acima. Não mexa em `packages/backend/.env.test`.

```bash
cp packages/backend/.env.example packages/backend/.env      # Windows: copy packages\backend\.env.example packages\backend\.env
```

> Prefere usar o Postgres do Supabase em vez do local? Em **Project Settings → Database → Connection string → Transaction pooler** (porta `6543`), copie a URL, troque `[YOUR-PASSWORD]` pela senha do projeto e coloque em `DATABASE_URL`. Os testes continuam usando o Postgres local.

**4. Criar o schema e o primeiro administrador:**

```bash
npm run db:migrar
npm run db:criar-admin -- "Seu Nome" seu@email.com "uma-senha-forte"
```

**5. Subir backend e frontend:**

```bash
npm run dev                  # os dois juntos (backend :3001, frontend :3000)
# ou, em dois terminais:
npm run dev:backend
npm run dev:frontend
```

Confira os endereços da seção [6 do Início rápido](#6-conferir-que-está-tudo-no-ar) (exceto o banco, que aqui usa a porta do seu Postgres).

---

## Variáveis de ambiente

### Backend (`packages/backend/.env`)

| Variável                                                         | Descrição                                                                                                                                                                                                       | Onde é usada                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`                                                   | String de conexão do PostgreSQL — local (dev) ou do Supabase (produção, Transaction pooler, porta `6543`). **No Docker é ignorada** (o compose usa o banco do container)                                          | Dev sem Docker e Render                                 |
| `PORT`                                                           | Porta em que a API sobe. **No Docker é fixada em `3001`**                                                                                                                                                       | Dev sem Docker (Render define a sua própria)            |
| `JWT_SECRET`                                                     | Segredo usado para assinar os tokens de login. **Precisa ser um valor diferente e aleatório em produção** (ex.: `openssl rand -hex 32`)                                                                         | Dev (Docker ou não) e Render                            |
| `JWT_EXPIRACAO`                                                  | Validade do token de login (ex. `7d`)                                                                                                                                                                           | Dev (Docker ou não) e Render                            |
| `SUPABASE_URL`                                                   | URL do projeto Supabase. **Obrigatória** — sem ela o servidor não sobe                                                                                                                                          | Dev (Docker ou não) e Render                            |
| `SUPABASE_SERVICE_ROLE_KEY`                                      | Chave de acesso total do Supabase (formato `sb_secret_...`), usada só no backend para gravar no Storage. **Obrigatória**, nunca exposta ao frontend                                                             | Dev (Docker ou não) e Render                            |
| `SUPABASE_STORAGE_BUCKET`                                        | Nome do bucket público do Supabase Storage onde ficam as fotos e documentos enviados                                                                                                                            | Dev (Docker ou não) e Render                            |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Credenciais SMTP para envio de e-mails (confirmação, aprovação/reprovação, código de check-in). Opcionais — sem elas, os e-mails só são registrados no console ("modo simulação"). Passo a passo em `rotas.md`. | Dev (Docker ou não) e Render (opcional nos dois)        |

Todas as variáveis do backend ficam em `packages/backend/.env` localmente (a partir do `.env.example`) e são cadastradas direto no painel do Render em produção — nenhuma delas é um Secret do GitHub Actions (ver [Deploy e CI/CD](#deploy-e-cicd)).

Arquivos enviados (fotos, documentos) vão para o **Supabase Storage** (`services/armazenamento.js`) — não existe armazenamento em disco local.

### Frontend

Em desenvolvimento **não é preciso criar nenhum arquivo** (o Docker já define as variáveis; sem Docker vale o padrão `http://localhost:3001`). Em produção, são cadastradas nas Environment Variables da Vercel.

| Variável              | Descrição                                                                                                                                                                 | Onde é usada                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da API consumida **pelo navegador**. Sem Docker cai para `http://localhost:3001` se não for definida; em produção precisa apontar para a URL pública do backend no Render | Dev local (opcional) e Vercel (obrigatória)          |
| `API_URL_INTERNA`     | URL da API usada **pelo servidor do Next.js** (Server Components). Só existe no Docker (`http://backend:3001`); quando ausente, vale `NEXT_PUBLIC_API_URL`                  | Somente Docker (já definida no `docker-compose.yml`) |

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

Com Docker, estes comandos têm equivalentes nas seções [Comandos do dia a dia](#comandos-do-dia-a-dia) e [Testes](#testes).

## Arquitetura resumida

Monorepo com `packages/frontend` (Next.js, App Router) e `packages/backend` (Express) organizados via **npm workspaces**.

**Backend**: organizado em camadas por domínio dentro de `src/modules/<dominio>/` — cada módulo (`usuarios`, `eventos`, `veiculos`, `inscricoes`, `historias`, `contato`, `instagram`, `uploads`) segue o mesmo padrão de três arquivos:

- `*.repositorio.js` — a única camada que sabe escrever SQL / falar com o `pg`
- `*.servico.js` — regras de negócio e validação (usando `zod`)
- `*.rotas.js` — mapeia HTTP para as funções do serviço

`src/db.js` centraliza a conexão com o PostgreSQL e expõe `query()` e `transacao()`. Regras de negócio críticas são garantidas com `UNIQUE`/`CHECK` no próprio banco (1 evento por dia, capacidade máxima de 600 por evento), não só na aplicação. Limites que evoluem com mais frequência (até 10 fotos por veículo, até 50 por evento) ficam na camada de serviço.

**Frontend**: App Router do Next.js. Páginas públicas (`/`, `/agenda`, `/agenda/[id]`, `/acervo`, `/historias`, `/inscricao`) são Server Components que buscam dados direto da API com `cache: "no-store"` — sempre a versão mais recente, sem o atraso de um cache de fetch do Next.js ficando desatualizado depois que o admin cadastra algo. O painel administrativo (`/admin/**`) é protegido por uma sessão JWT guardada no navegador (`useSyncExternalStore`, sem `useState`+`useEffect`) — veja `rotas.md` para o detalhe de cada rota.

## Deploy e CI/CD

Repositório no GitHub, com um único workflow (`.github/workflows/ci-cd.yml`) cuidando de teste e deploy. O Docker deste repositório é **só para desenvolvimento local**: o deploy continua sendo feito pela Render e pela Vercel, sem usar o `Dockerfile`.

### Como o pipeline funciona

**Gatilhos:** todo `push` ou `pull request` para as branches `main` e `dev` disparam o workflow; também pode ser executado manualmente (`workflow_dispatch`).

**Jobs de teste (rodam sempre, nas duas branches e em PRs):**

1. `test-backend` — sobe um Postgres 16 descartável como serviço do próprio GitHub Actions e roda `npm run test -w packages/backend` contra ele. Não toca no Supabase.
2. `test-frontend` — roda `npm run lint` e `npm run test -w packages/frontend` (não precisa de banco).
3. `e2e` — depende dos dois anteriores. Sobe outro Postgres descartável, copia `packages/backend/.env.test` para `.env`, roda as migrações, cria um admin de teste, sobe o backend e o frontend em segundo plano, espera os dois responderem (`wait-on`) e roda `npm run test:e2e -w packages/frontend` (Playwright) contra eles.

**Performance (não bloqueia o deploy):**

- `performance` — depende de `test-backend` e `test-frontend` e roda apenas em push na `main` ou manualmente. Faz o build de produção do frontend, sobe backend e frontend e executa os microbenchmarks e o teste de carga do backend (Vitest) e os testes de performance do frontend (Playwright, com `continue-on-error`, pois LCP/TTFB variam num runner compartilhado).

**Deploy (só em push direto na `main`, e só se os três jobs de teste acima passarem):**

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

Nenhuma credencial do Supabase, `JWT_SECRET` ou SMTP é um Secret do GitHub — essas vivem só nos painéis da Render (backend em produção) e no `.env` local de cada um (dev); o CI usa as suas próprias, falsas, só pra rodar os testes (ver [Testes](#testes)).

## Estrutura

```
veteran_carclub/
├── package.json                  # raiz do monorepo (workspaces)
├── README.md
├── Dockerfile                    # imagens do ambiente local (targets: backend, frontend, frontend-prod, playwright)
├── docker-compose.yml            # db + backend + frontend; perfis "test" e "e2e"
├── .dockerignore                 # mantém segredos e node_modules fora das imagens
├── docker/
│   └── postgres/init/
│       └── 01-criar-banco-de-testes.sql   # cria veteran_carclub_test na 1ª subida
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # testes + performance + deploy condicional (Render/Vercel)
├── docs/
│   ├── rotas.md                  # documentação de todas as rotas
│   └── database.md               # diagrama ER (Mermaid) do banco de dados
└── packages/
    ├── backend/
    │   ├── package.json
    │   ├── .env.example
    │   ├── .env.test             # config de teste (versionado, sem segredo real)
    │   ├── vitest.config.js
    │   ├── vitest.load.config.js # config do teste de carga
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
    │       └── performance/      # microbenchmarks (*.bench.js) e testes de carga (*.load.js)
    └── frontend/
        ├── package.json
        ├── next.config.ts
        ├── vitest.config.ts
        ├── playwright.config.ts
        ├── playwright.perf.config.ts   # config dos testes de performance
        ├── tsconfig.json
        ├── public/
        ├── tests/                # Vitest + React Testing Library (componentes)
        ├── e2e/                  # Playwright (ponta a ponta, stack completa)
        │   └── performance/      # Web Vitals por página + sessões simultâneas
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
            │   ├── api.ts          # fetchers públicos (sem cache, sem mock); URL da API (navegador x servidor)
            │   ├── admin-auth.ts   # sessão JWT client-side + fetch autenticado
            │   ├── upload.ts       # helper de upload de arquivos
            │   └── formatadores.ts # formatação de data/horário/iniciais
            └── types/
                └── index.ts
```

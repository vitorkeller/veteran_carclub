# Veteran Car Club

Projeto da disciplina **Projeto de Aprendizagem Colaborativa Extensionista (PAC VI)**.

## Integrantes

- Vitor Arthur Keller — @vitorkeller
- Lucas Camilo Moraes — @hub-Moraes

## Stack tecnológica

| Camada         | Tecnologia          |
| ----------     | ------------------- |
| Frontend       | React + Next.js     |
| Backend        | Node.js + Express   |
| Banco de dados | PostgreSQL          |
| Monorepo       | npm workspaces      |

## Como rodar localmente

Requisitos: **Node.js 20.6 ou superior** e um **PostgreSQL** rodando na sua máquina.

### 1. Instalar dependências

```bash
npm install
```

Instala as dependências do frontend e do backend de uma vez (workspaces na raiz).

### 2. Configurar o banco de dados

Crie o usuário e o banco no seu PostgreSQL local:

```bash
sudo -u postgres psql
```

```sql
CREATE USER veteran_carclub WITH PASSWORD 'veteran_carclub';
CREATE DATABASE veteran_carclub OWNER veteran_carclub;
\q
```

Copie o arquivo de exemplo de variáveis de ambiente do backend:

```bash
cp packages/backend/.env.example packages/backend/.env
```

O `.env` já aponta para `postgres://veteran_carclub:veteran_carclub@localhost:5432/veteran_carclub`. Ajuste usuário, senha ou porta se o seu PostgreSQL local estiver configurado de outra forma.

### 3. Criar o schema do banco

```bash
npm run db:migrar
```

Deve imprimir `schema criado`.

### 4. Subir o backend

```bash
npm run dev:backend
```

API disponível em `http://localhost:3001`. Verificação de saúde: `http://localhost:3001/api/saude`.

### 5. Subir o frontend

Em outro terminal:

```bash
npm run dev:frontend
```

Aplicação disponível em `http://localhost:3000`.

## Variáveis de ambiente

Definidas em `packages/backend/.env` (veja `packages/backend/.env.example`):

| Variável       | Descrição                              | Padrão local                                                     |
| -------------- | --------------------------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL` | String de conexão do PostgreSQL         | `postgres://veteran_carclub:veteran_carclub@localhost:5432/veteran_carclub` |
| `PORT`         | Porta em que a API do backend sobe      | `3001`                                                              |

## Arquitetura resumida

Monorepo com `packages/frontend` (Next.js) e `packages/backend` (Express) organizados via **npm workspaces**. O frontend consome a API REST do backend em `/api/*`; o backend fala com o PostgreSQL local através de `src/db.js`, que expõe `query()` devolvendo `{ rows }` — a única camada que sabe que o banco é PostgreSQL, para manter o acesso a dados isolado das regras de negócio.

## Estrutura

```
packages/backend/src/server.js        entrypoint (npm run dev:backend)
packages/backend/src/db.js            conexão e schema do banco (pronto)
packages/backend/src/app.js           rotas da API
packages/backend/src/veiculos.js      regras de negócio      <- implementar
packages/backend/src/repositorio.js   acesso ao banco (SQL)  <- implementar
packages/backend/tests/               testes automatizados
packages/frontend/src/app/            páginas e componentes (Next.js App Router)
```

## MVP


## Backlog

Backlog disponível em https://trello.com/invite/b/685dde423dcd699144fac43a/ATTIbdfcf28a3bfbfb282fe40f2ef5744ddaF7726C6C/veteran-car-club

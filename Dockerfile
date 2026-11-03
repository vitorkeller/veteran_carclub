# syntax=docker/dockerfile:1.7
#
# Dockerfile único do monorepo (contexto de build = raiz do repositório).
# Cada serviço do docker-compose.yml escolhe um "target" abaixo.
# Debian (bookworm-slim) em vez de Alpine: o Playwright e os binários nativos
# do Next.js/Tailwind funcionam melhor com glibc.

ARG NODE_VERSION=22

# ---------------------------------------------------------------- deps
# Instala as dependências de TODOS os workspaces a partir do package-lock.json
# (mesmo comando do CI: `npm ci`). Esta camada só é refeita quando algum
# package.json ou o lockfile muda.
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY packages/backend/package.json  packages/backend/package.json
COPY packages/frontend/package.json packages/frontend/package.json
RUN npm ci

# ---------------------------------------------------------------- fonte
FROM deps AS fonte
COPY . .

# ---------------------------------------------------------------- backend
# Usado em dev, nos testes, no E2E e nos testes de carga. O código-fonte é
# sobrescrito por bind mounts no docker-compose.yml (hot reload em dev).
FROM fonte AS backend
ENV NODE_ENV=development
WORKDIR /app/packages/backend
EXPOSE 3001
CMD ["node", "src/server.js"]

# ---------------------------------------------------------------- frontend (dev)
FROM fonte AS frontend
ENV NODE_ENV=development
WORKDIR /app/packages/frontend
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]

# ---------------------------------------------------------------- frontend (produção, p/ E2E e performance)
# NEXT_PUBLIC_API_URL é embutida no bundle em tempo de build — por isso é ARG.
FROM fonte AS frontend-prod
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
WORKDIR /app/packages/frontend
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]

# ---------------------------------------------------------------- playwright
# Chromium + dependências de sistema, na MESMA versão do @playwright/test do
# lockfile (instalado a partir do node_modules acima — sem risco de descasar
# com uma imagem oficial de outra versão).
FROM fonte AS playwright
WORKDIR /app/packages/frontend
RUN npx playwright install --with-deps chromium \
	&& rm -rf /var/lib/apt/lists/*

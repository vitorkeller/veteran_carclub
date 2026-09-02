# Rotas do Veteran Carclub

Este documento lista todas as rotas existentes no projeto até o momento:
as páginas do **frontend** (Next.js) e os **endpoints da API** (Express).

---

## Frontend (Next.js)

### Públicas

| Caminho        | Arquivo                        | O que renderiza                                                                                                                                                                                                                                                                                                                                                           |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`            | `src/app/page.tsx`             | Home: Hero, Eventos em destaque, Feed social, Histórias em destaque e Contato (formulário funcional).                                                                                                                                                                                                                                                                     |
| `/agenda`      | `src/app/agenda/page.tsx`      | Agenda de Eventos: próximos encontros (com inscrição — o link só existe aqui, dentro do card) e histórico de encontros passados (clicáveis).                                                                                                                                                                                                                              |
| `/agenda/[id]` | `src/app/agenda/[id]/page.tsx` | Detalhe de um evento: capa, local, comparecimento (calculado), inscrição (se ainda não passou), texto da história vinculada, carrossel da galeria, carros em destaque (curados pelo admin) e lista completa de participantes.                                                                                                                                             |
| `/acervo`      | `src/app/acervo/page.tsx`      | Catálogo de veículos aprovados na curadoria do admin. Clicar em um carro abre um modal com carrossel (até 10 fotos) e ficha completa.                                                                                                                                                                                                                                     |
| `/historias`   | `src/app/historias/page.tsx`   | Listagem completa de histórias — cada uma é o resumo de um evento passado, com a capa do evento. Clicar leva ao detalhe do evento (`/agenda/[id]`).                                                                                                                                                                                                                       |
| `/inscricao`   | `src/app/inscricao/page.tsx`   | Cadastro + inscrição em um evento específico — **exige `?evento=<id>`** (sem isso, direciona para a Agenda). Fluxo visitante (nome/e-mail/Instagram, sem senha) ou expositor (+ documento e fotos do veículo, upload real). Ao inscrever-se, a pessoa recebe um e-mail com o código de check-in (visitante, na hora) ou de "fila de espera" (expositor, até a aprovação). |

Nenhuma dessas páginas usa dados de exemplo: se a API não responder, elas
mostram um aviso de erro (não um mock disfarçado de dado real). Também não
existe mais nenhum botão genérico de "Inscreva-se" na Navbar ou na Home — a
inscrição só aparece dentro do card ou da página de um evento futuro específico.

### Painel administrativo

Acesso restrito a usuários com `tipo = 'admin'` no banco. A sessão é
guardada no navegador (JWT em `localStorage`); qualquer rota abaixo de
`/admin` (exceto `/admin/login`) redireciona para o login se não houver
uma sessão de administrador válida.

| Caminho            | Arquivo                                        | O que renderiza                                                                                                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/login`     | `src/app/admin/login/page.tsx`                 | Formulário de login (e-mail/senha), autentica contra `POST /api/usuarios/login`.                                                                                                                                                                                                          |
| `/admin`           | `src/app/admin/(protegido)/page.tsx`           | Dashboard: contadores rápidos (pendentes, próximos eventos, veículos) e atalhos para as telas.                                                                                                                                                                                            |
| `/admin/usuarios`  | `src/app/admin/(protegido)/usuarios/page.tsx`  | **Dashboard de Inscritos**: lista de eventos; clique para expandir e ver os inscritos em duas abas — **Inscritos Visitantes** (nome, e-mail, status de check-in) e **Inscritos Expositores** (com foto do veículo e link do documento enviado, para avaliar antes de aprovar/rejeitar).   |
| `/admin/eventos`   | `src/app/admin/(protegido)/eventos/page.tsx`   | Criação/edição de eventos (nome, data, horário de início/término, capacidade, capa) + **check-in na portaria** (campo para digitar o código apresentado pela pessoa) + galeria de fotos (até 50, só para eventos já realizados). Comparecimento não é mais editável — é sempre calculado. |
| `/admin/historias` | `src/app/admin/(protegido)/historias/page.tsx` | CRUD de histórias vinculadas a um evento passado (sem o campo de nome de destaque): curadoria de quais veículos participantes ganham destaque (com fotos e descrição) + upload da galeria de fotos do evento (até 50, reaproveitando os endpoints de galeria de eventos).                 |
| `/admin/veiculos`  | `src/app/admin/(protegido)/veiculos/page.tsx`  | Todos os veículos cadastrados (publicados ou não): edição de ficha, **gestão das fotos existentes** (visualizar, excluir uma a uma, adicionar novas) e curadoria — botão para publicar/remover do Acervo público.                                                                         |

> `(protegido)` é um _route group_ do Next.js: organiza os arquivos sem
> aparecer na URL. O guard de sessão vive em
> `src/app/admin/(protegido)/layout.tsx`.

---

## Backend (API Express)

Base URL em desenvolvimento: `http://localhost:3001`. Todas as respostas são
JSON. Erros seguem o formato `{ "erro": "mensagem" }`.

**Legenda de middlewares:**

- **Pública** — sem autenticação
- **Autenticado** — exige `Authorization: Bearer <token>` válido (`autenticar`)
- **Aprovado** — autenticado + `status = 'aprovado'` (`exigirAprovado`)
- **Admin** — autenticado + `tipo = 'admin'` (`exigirAdmin`)

### `GET /api/saude`

Pública. Verificação de saúde da API — responde `{ "ok": true }`.

### Usuários — `/api/usuarios`

| Método  | Caminho       | Middleware | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`  | `/registrar`  | Pública    | **Cadastro + inscrição no evento em uma única ação atômica.** `eventoId` é obrigatório — não existe mais cadastro sem evento. **Sem senha**: visitante/expositor não fazem login, então não há por que guardar uma. Visitante é aprovado automaticamente (`status: 'aprovado'`) e recebe por e-mail o código de check-in na hora; expositor entra em análise (e-mail de "fila de espera") até o admin aprovar/rejeitar. Expositor pode incluir até 10 URLs de imagens do veículo (`veiculo.imagens`), obtidas via `POST /api/uploads`. A capacidade do evento (≤ 600) é verificada com `FOR UPDATE`, igual à rota de inscrições. |
| `POST`  | `/login`      | Pública    | Autentica e-mail/senha, devolve `{ token, usuario }`. **Só funciona para administradores** — visitantes/expositores não têm `senha_hash` (a coluna é `NULL` para eles).                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `GET`   | `/pendentes`  | Admin      | Lista cadastros com `status = 'pendente'` (usado no contador do dashboard).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `PATCH` | `/:id/status` | Admin      | Aprova ou rejeita o cadastro de um expositor (`{ "status": "aprovado" \| "rejeitado" }`). **Aprovado**: envia e-mail com o código de check-in. **Rejeitado**: cancela a inscrição dele nesse evento (libera a vaga) e envia e-mail avisando — como o e-mail já está cadastrado (`UNIQUE`), a pessoa não consegue se inscrever de novo nesse mesmo evento.                                                                                                                                                                                                                                                                        |

### Eventos — `/api/eventos`

| Método   | Caminho                  | Middleware | Descrição                                                                                                                                                                                                                                                                                           |
| -------- | ------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/`                      | Pública    | Sem query: `{ proximos, passados }` (Agenda). Com `?destaque=1`: até 3 próximos eventos (Home).                                                                                                                                                                                                     |
| `GET`    | `/:id`                   | Pública    | Detalhe de um evento. Se já passou, inclui `galeria`, `veiculos_participantes`, `presentes` (**sempre calculado** a partir das inscrições confirmadas — não é mais um valor manual), e, se existir, `historia` (título/conteúdo) e `veiculos_destaque` (com fotos e descrição, curados pelo admin). |
| `POST`   | `/`                      | Admin      | Cria um evento. Exige `horarioInicio`/`horarioTermino` (`HH:MM`, término > início). `data_evento` é `UNIQUE` (1 evento por dia); `cidade` é sempre "Joinville".                                                                                                                                     |
| `PUT`    | `/:id`                   | Admin      | Atualiza campos do evento. **Não aceita mais `presentes`** — o comparecimento nunca é definido manualmente.                                                                                                                                                                                         |
| `DELETE` | `/:id`                   | Admin      | Remove um evento.                                                                                                                                                                                                                                                                                   |
| `POST`   | `/:id/galeria`           | Admin      | Adiciona fotos à galeria do evento (`{ urls: string[] }`). Limite de 50 imagens por evento.                                                                                                                                                                                                         |
| `DELETE` | `/:id/galeria/:imagemId` | Admin      | Remove uma foto específica da galeria.                                                                                                                                                                                                                                                              |
| `GET`    | `/:id/participantes`     | Admin      | Lista os veículos inscritos como expositores no evento — usado na curadoria de "carros em destaque" na tela de Histórias.                                                                                                                                                                           |

### Veículos — `/api/veiculos`

| Método   | Caminho                         | Middleware | Descrição                                                                                                                                                             |
| -------- | ------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/painel`                       | Admin      | **Todos** os veículos (publicados ou não), com imagens já incluindo `{ id, url }` (para permitir excluir uma foto específica). Precisa vir antes de `/:id` nas rotas. |
| `GET`    | `/`                             | Pública    | Acervo público: só veículos com `publicado_acervo = true`, com dono, imagens (`string[]`) e tags de eventos.                                                          |
| `GET`    | `/:id`                          | Pública    | Detalhe de um veículo para o modal do Acervo — 404 se não existir ou não estiver publicado.                                                                           |
| `POST`   | `/`                             | Aprovado   | Expositor aprovado cadastra um veículo adicional ao seu (com até 10 imagens).                                                                                         |
| `PATCH`  | `/:id/acervo`                   | Admin      | Curadoria: publica ou remove o veículo da vitrine pública (`{ "publicado": true \| false }`).                                                                         |
| `PUT`    | `/:id`                          | Admin      | Admin corrige a ficha de qualquer veículo do acervo.                                                                                                                  |
| `DELETE` | `/:id`                          | Admin      | Admin remove um veículo (ex.: cadastro duplicado).                                                                                                                    |
| `POST`   | `/:id/imagens`                  | Admin      | Adiciona novas fotos a um veículo já cadastrado (`{ urls: string[] }`). Limite de 10 imagens no total.                                                                |
| `DELETE` | `/:veiculoId/imagens/:imagemId` | Admin      | Remove uma foto específica do veículo.                                                                                                                                |

### Inscrições — `/api/inscricoes`

| Método | Caminho                     | Middleware | Descrição                                                                                                                                                                                                                                                                                                                 |
| ------ | --------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/`                         | Aprovado   | Inscreve o usuário **já autenticado** em um evento adicional (`{ eventoId, veiculoId? }`). Continua existindo para uso futuro, mas hoje o fluxo normal de inscrição acontece via `POST /api/usuarios/registrar` (ver acima), já que ainda não há sessão de login para visitantes/expositores no frontend.                 |
| `GET`  | `/minhas`                   | Aprovado   | Lista as inscrições do usuário autenticado.                                                                                                                                                                                                                                                                               |
| `GET`  | `/evento/:eventoId`         | Admin      | **Dashboard de Inscritos**: todas as pessoas (visitantes e expositores) inscritas em um evento — inclui `codigo_checkin`, `checkin_em`, e para expositores o documento e as fotos do veículo (`veiculo_documento_url`, `veiculo_imagens`).                                                                                |
| `POST` | `/evento/:eventoId/checkin` | Admin      | **Check-in na portaria**: admin digita o código (`{ "codigo": "A3F9K2" }`) apresentado pela pessoa. Valida se o código pertence a uma inscrição confirmada _desse evento específico_, se ainda não fez check-in, e registra `checkin_em = now()`. Devolve nome, tipo e veículo (se houver) para o admin conferir na hora. |

**Código de check-in**: gerado automaticamente (6 caracteres alfanuméricos,
sem `O`/`I`/`0`/`1` para evitar confusão) no momento da inscrição — tanto
para visitante quanto para expositor, mesmo que o expositor ainda esteja
pendente (o código só é _revelado_ por e-mail depois da aprovação). Único
por evento via índice parcial (`idx_inscricoes_codigo_checkin`).

### Histórias — `/api/historias`

| Método   | Caminho | Middleware | Descrição                                                                                                                                                                                                                            |
| -------- | ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`    | `/`     | Pública    | Sem query: todas as histórias (página `/historias`). Com `?destaque=1`: só as marcadas (Home).                                                                                                                                       |
| `GET`    | `/:id`  | Pública    | Detalhe de uma história.                                                                                                                                                                                                             |
| `POST`   | `/`     | Admin      | Cria uma história. `eventoId` é **obrigatório** — toda história é o recorte de um evento passado. Aceita `veiculosDestaqueIds: number[]` (quais veículos participantes ganham destaque, com fotos e descrição, na página do evento). |
| `PUT`    | `/:id`  | Admin      | Atualiza uma história (inclui marcar/desmarcar destaque e trocar os `veiculosDestaqueIds`).                                                                                                                                          |
| `DELETE` | `/:id`  | Admin      | Remove uma história.                                                                                                                                                                                                                 |

`GET /:id` (admin, ao editar) também devolve `veiculos_destaque_ids: number[]`,
usado para pré-marcar os checkboxes de curadoria na tela de edição.

### Uploads — `/api/uploads`

| Método | Caminho | Middleware | Descrição                                                                                                                                                                               |
| ------ | ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/`     | Pública    | `multipart/form-data`, campo `arquivos` (até 50). Devolve `{ urls: string[] }`. Público de propósito: o cadastro de expositor precisa enviar arquivos antes de existir uma conta/token. |

**Armazenamento (disco local):** cada arquivo é salvo via `services/armazenamento.js` em `packages/backend/uploads/` e servido em `GET /uploads/<arquivo>`. Não há nenhum armazenamento externo, os arquivos ficam só no disco do próprio servidor, então não sobrevivem a um redeploy em plataformas com filesystem efêmero.

### Contato — `/api/contato`

| Método   | Caminho     | Middleware | Descrição                                           |
| -------- | ----------- | ---------- | --------------------------------------------------- |
| `POST`   | `/`         | Pública    | Envia uma mensagem de contato (formulário da Home). |
| `GET`    | `/`         | Admin      | Lista todas as mensagens recebidas.                 |
| `PATCH`  | `/:id/lida` | Admin      | Marca uma mensagem como lida.                       |
| `DELETE` | `/:id`      | Admin      | Remove uma mensagem.                                |

> Ainda não existe uma tela no painel admin para essas duas últimas rotas —
> é um próximo passo natural, já que o backend está pronto.

---

## E-mails — fluxo de notificações

Não existe um endpoint próprio de e-mail (não é algo que o frontend chama
diretamente) — os e-mails são disparados automaticamente pelo backend, em
`services/email.js` (envio via SMTP com Nodemailer) + `services/emailTemplates.js`
(o texto de cada mensagem), a partir dos seguintes gatilhos:

| Gatilho                                                      | E-mail enviado                                                                                                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitante se inscreve (`POST /api/usuarios/registrar`)       | Confirmação imediata, já com o **código de check-in** (aprovação é automática).                                                                                      |
| Expositor se inscreve (`POST /api/usuarios/registrar`)       | E-mail #1: cadastro em análise ("fila de espera") — sem o código ainda.                                                                                              |
| Admin aprova o expositor (`PATCH /api/usuarios/:id/status`)  | E-mail #2: aprovação, parabenizando e enviando o **código de check-in**.                                                                                             |
| Admin rejeita o expositor (`PATCH /api/usuarios/:id/status`) | E-mail #2: reprovação. A inscrição é cancelada (libera a vaga) e, como o e-mail já tem cadastro (`UNIQUE`), a pessoa não consegue se inscrever de novo nesse evento. |

**Modo simulação (padrão, sem configuração nenhuma):** sem `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`
no `.env`, nenhum e-mail é enviado de verdade — o conteúdo (destinatário,
assunto, corpo) é só registrado no console do backend. Uma falha de envio
(configurado ou não) nunca desfaz o cadastro/aprovação que a originou: a
pessoa já está salva no banco antes do e-mail ser sequer tentado.

**Como configurar envio real** (qualquer provedor SMTP — Resend, SendGrid,
Gmail com senha de app, etc.): preencha `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS` e `EMAIL_FROM` no `.env` do backend.

---

## Autenticação — como funciona

1. `POST /api/usuarios/login` devolve um **JWT** assinado com `JWT_SECRET`,
   válido por `JWT_EXPIRACAO` (padrão 7 dias). O payload contém `id`, `tipo`
   e `status` do usuário. **Só funciona para admins** — visitante/expositor
   não têm senha (não existe app de usuário final, só o painel do admin).
2. Rotas protegidas esperam o header `Authorization: Bearer <token>`.
3. `autenticar` valida o token e popula `req.usuario`; `exigirAdmin` e
   `exigirAprovado` checam `req.usuario.tipo`/`status` em seguida.
4. Administradores **não têm rota pública de registro** — são criados com
   `npm run db:criar-admin` (ver `README.md`).
5. Visitantes e expositores **não fazem login**: o cadastro em
   `POST /api/usuarios/registrar` já é a inscrição no evento (ver seção de
   Usuários acima), e como eles não têm senha, `/login` nem aceitaria suas
   credenciais. O código de check-in (enviado por e-mail) é o único
   "comprovante" que precisam apresentar, na portaria do evento.

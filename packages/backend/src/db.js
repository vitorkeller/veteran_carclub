// Conexão com o PostgreSQL — local ou hospedado (Supabase, por exemplo).
import pg from 'pg';

const { Pool, types } = pg;

// Corrige um bug real: por padrão, o driver `pg` converte colunas DATE em
// objetos JS Date. Ao serializar em JSON (res.json), isso vira uma string
// completa com horário/timezone (ex.: "2026-06-23T03:00:00.000Z") em vez de
// só "2026-06-23" -- e o frontend, que espera "AAAA-MM-DD", quebra ao tentar
// separar a data. OID 1082 é o tipo `date` no Postgres; forçamos ele a
// continuar chegando como a string crua que o Postgres já devolve.
types.setTypeParser(1082, (valor) => valor);

let pool;

export function conexao() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Bancos hospedados (Supabase, Neon, etc.) exigem SSL; o Postgres
      // local de desenvolvimento não. O driver `pg` não ativa SSL sozinho
      // a partir do `sslmode` na connection string, então detectamos pelo
      // host.
      ssl: /supabase\.(co|com)/.test(process.env.DATABASE_URL ?? '') ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

/**
 * Executa uma consulta e devolve { rows }.
 * Use $1, $2, ... como marcador de parâmetro (evita injeção de SQL):
 *   query('SELECT * FROM veiculos WHERE id = $1', [id])
 */
export async function query(sql, valores = []) {
  const { rows } = await conexao().query(sql, valores);
  return { rows };
}

/**
 * Executa `fn(cliente)` dentro de uma transação (BEGIN/COMMIT/ROLLBACK).
 * Necessário sempre que uma regra de negócio depender de ler-e-depois-escrever
 * de forma atômica (ex.: checar capacidade do evento antes de inserir inscrição).
 */
export async function transacao(fn) {
  const cliente = await conexao().connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await fn({
      query: (sql, valores = []) => cliente.query(sql, valores).then((r) => ({ rows: r.rows })),
    });
    await cliente.query('COMMIT');
    return resultado;
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
}

/** Cria o schema, se ainda não existir. Rodado por `npm run db:migrar` e ao subir o servidor. */
export async function migrar() {
  await conexao().query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id             SERIAL PRIMARY KEY,
      nome_completo  TEXT NOT NULL,
      email          TEXT NOT NULL UNIQUE,
      -- Nullable: visitantes/expositores não têm login (não existe app de
      -- usuário final, só o admin loga). Só contas de admin têm senha.
      senha_hash     TEXT,
      instagram      TEXT,
      tipo           TEXT NOT NULL DEFAULT 'visitante'
                       CHECK (tipo IN ('visitante', 'expositor', 'admin')),
      status         TEXT NOT NULL DEFAULT 'pendente'
                       CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
      criado_em      TIMESTAMP NOT NULL DEFAULT now()
    );
    -- Cobre quem já rodou a migração quando essa coluna ainda era obrigatória.
    ALTER TABLE usuarios ALTER COLUMN senha_hash DROP NOT NULL;

    CREATE TABLE IF NOT EXISTS eventos (
      id                 SERIAL PRIMARY KEY,
      nome               TEXT NOT NULL,
      descricao          TEXT,
      data_evento        DATE NOT NULL UNIQUE, -- regra: apenas 1 evento por dia
      horario_inicio     TIME,
      horario_termino    TIME,
      cidade             TEXT NOT NULL DEFAULT 'Joinville',
      local              TEXT,
      capacidade_maxima  INTEGER NOT NULL DEFAULT 600 CHECK (capacidade_maxima > 0 AND capacidade_maxima <= 600),
      imagem_capa_url    TEXT, -- 1 imagem de capa (eventos futuros)
      presentes          INTEGER, -- comparecimento real, preenchido pelo admin após o evento
      status             TEXT NOT NULL DEFAULT 'agendado'
                           CHECK (status IN ('agendado', 'realizado', 'cancelado')),
      criado_em          TIMESTAMP NOT NULL DEFAULT now()
    );
    -- Cobre quem já rodou a migração antes destas colunas existirem.
    ALTER TABLE eventos ADD COLUMN IF NOT EXISTS horario_inicio TIME;
    ALTER TABLE eventos ADD COLUMN IF NOT EXISTS horario_termino TIME;
    ALTER TABLE eventos ADD COLUMN IF NOT EXISTS presentes INTEGER;

    CREATE TABLE IF NOT EXISTS veiculos (
      id                  SERIAL PRIMARY KEY,
      usuario_id          INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      nome                TEXT NOT NULL,
      modelo              TEXT NOT NULL,
      ano                 INTEGER NOT NULL CHECK (ano BETWEEN 1885 AND 2100),
      modificacoes        TEXT,
      documento_url       TEXT,
      imagem_url          TEXT,
      publicado_acervo    BOOLEAN NOT NULL DEFAULT false, -- curadoria: só true aparece no Acervo público
      criado_em           TIMESTAMP NOT NULL DEFAULT now()
    );
    -- Cobre quem já rodou a migração antes desta coluna existir.
    ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS publicado_acervo BOOLEAN NOT NULL DEFAULT false;

    -- Até 10 imagens por veículo (limite aplicado na camada de serviço).
    CREATE TABLE IF NOT EXISTS veiculo_imagens (
      id          SERIAL PRIMARY KEY,
      veiculo_id  INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
      url         TEXT NOT NULL,
      ordem       INTEGER NOT NULL DEFAULT 0,
      criado_em   TIMESTAMP NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS inscricoes (
      id              SERIAL PRIMARY KEY,
      evento_id       INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      veiculo_id      INTEGER REFERENCES veiculos(id) ON DELETE SET NULL,
      tipo            TEXT NOT NULL CHECK (tipo IN ('visitante', 'expositor')),
      status          TEXT NOT NULL DEFAULT 'confirmada'
                        CHECK (status IN ('confirmada', 'cancelada')),
      -- Código curto que a pessoa apresenta na portaria; check-in é feito por
      -- um admin digitando esse código na tela do evento.
      codigo_checkin  TEXT,
      checkin_em      TIMESTAMP,
      criado_em       TIMESTAMP NOT NULL DEFAULT now(),
      UNIQUE (evento_id, usuario_id)
    );
    -- Cobre quem já rodou a migração antes destas colunas existirem.
    ALTER TABLE inscricoes ADD COLUMN IF NOT EXISTS codigo_checkin TEXT;
    ALTER TABLE inscricoes ADD COLUMN IF NOT EXISTS checkin_em TIMESTAMP;
    -- Índice único parcial: cada código só existe uma vez entre as
    -- inscrições que já têm um (não afeta linhas antigas sem código).
    CREATE UNIQUE INDEX IF NOT EXISTS idx_inscricoes_codigo_checkin
      ON inscricoes(codigo_checkin) WHERE codigo_checkin IS NOT NULL;

    CREATE TABLE IF NOT EXISTS historias (
      id          SERIAL PRIMARY KEY,
      titulo      TEXT NOT NULL,
      conteudo    TEXT NOT NULL,
      imagem_url  TEXT,
      autor_nome  TEXT, -- nome de exibição livre (nem toda história é de um usuário cadastrado)
      usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      veiculo_id  INTEGER REFERENCES veiculos(id) ON DELETE SET NULL,
      evento_id   INTEGER REFERENCES eventos(id) ON DELETE SET NULL,
      destaque    BOOLEAN NOT NULL DEFAULT false,
      criado_em   TIMESTAMP NOT NULL DEFAULT now()
    );
    -- Cobre quem já rodou a migração antes desta coluna existir.
    ALTER TABLE historias ADD COLUMN IF NOT EXISTS autor_nome TEXT;

    -- Curadoria: quais veículos participantes do evento ganham destaque
    -- (com fotos e descrição) na história daquele evento.
    CREATE TABLE IF NOT EXISTS historia_veiculos_destaque (
      id           SERIAL PRIMARY KEY,
      historia_id  INTEGER NOT NULL REFERENCES historias(id) ON DELETE CASCADE,
      veiculo_id   INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
      criado_em    TIMESTAMP NOT NULL DEFAULT now(),
      UNIQUE (historia_id, veiculo_id)
    );

    CREATE TABLE IF NOT EXISTS galeria_eventos (
      id          SERIAL PRIMARY KEY,
      evento_id   INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      imagem_url  TEXT NOT NULL,
      legenda     TEXT,
      criado_em   TIMESTAMP NOT NULL DEFAULT now()
    );

    -- Até 50 imagens por evento (limite aplicado na camada de serviço).
    CREATE TABLE IF NOT EXISTS contatos (
      id          SERIAL PRIMARY KEY,
      nome        TEXT NOT NULL,
      email       TEXT NOT NULL,
      mensagem    TEXT NOT NULL,
      lida        BOOLEAN NOT NULL DEFAULT false,
      criado_em   TIMESTAMP NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_veiculos_usuario_id ON veiculos(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_veiculo_imagens_veiculo_id ON veiculo_imagens(veiculo_id);
    CREATE INDEX IF NOT EXISTS idx_inscricoes_evento_id ON inscricoes(evento_id);
    CREATE INDEX IF NOT EXISTS idx_inscricoes_usuario_id ON inscricoes(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_historias_destaque ON historias(destaque) WHERE destaque = true;
    CREATE INDEX IF NOT EXISTS idx_historias_evento_id ON historias(evento_id);
    CREATE INDEX IF NOT EXISTS idx_eventos_data_evento ON eventos(data_evento);
    CREATE INDEX IF NOT EXISTS idx_galeria_eventos_evento_id ON galeria_eventos(evento_id);
    CREATE INDEX IF NOT EXISTS idx_historia_veiculos_destaque_historia_id ON historia_veiculos_destaque(historia_id);
  `);
}

/** Apaga todos os dados (respeitando dependências). Usado pelos testes. */
export async function limparBanco() {
  await conexao().query(`
    TRUNCATE TABLE contatos, historia_veiculos_destaque, veiculo_imagens, galeria_eventos, historias, inscricoes, veiculos, eventos, usuarios
    RESTART IDENTITY CASCADE
  `);
}

export async function encerrar() {
  if (pool) { await pool.end(); pool = undefined; }
}

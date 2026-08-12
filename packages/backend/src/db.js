// Conexão com o PostgreSQL local.
import pg from 'pg';

const { Pool } = pg;
let pool;

export function conexao() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
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

/** Cria o schema, se ainda não existir. Rodado por `npm run db:migrar` e ao subir o servidor. */
export async function migrar() {
  await conexao().query(`
    CREATE TABLE IF NOT EXISTS veiculos (
      id            SERIAL PRIMARY KEY,
      modelo        TEXT NOT NULL,
      ano           INTEGER NOT NULL,
      proprietario  TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'ativo',
      criado_em     TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
}

/** Apaga todos os dados. Usado pelos testes. */
export async function limparBanco() {
  await conexao().query('DELETE FROM veiculos');
}

export async function encerrar() {
  if (pool) { await pool.end(); pool = undefined; }
}

import { query } from '../../db.js';

const COLUNAS_PUBLICAS = 'id, nome_completo, email, instagram, tipo, status, criado_em';

export async function inserir({ nomeCompleto, email, senhaHash, instagram, tipo, status }, executor = { query }) {
  const { rows } = await executor.query(
    `INSERT INTO usuarios (nome_completo, email, senha_hash, instagram, tipo, status)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'pendente'))
     RETURNING ${COLUNAS_PUBLICAS}`,
    [nomeCompleto, email, senhaHash, instagram ?? null, tipo, status ?? null]
  );
  return rows[0];
}

/** Devolve a linha completa (incluindo senha_hash, que só existe para admins) — uso interno do serviço. */
export async function buscarPorEmail(email) {
  const { rows } = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return rows[0] ?? null;
}

export async function buscarPorId(id) {
  const { rows } = await query(`SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listarPorStatus(status) {
  const { rows } = await query(
    `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE status = $1 ORDER BY criado_em ASC`,
    [status]
  );
  return rows;
}

export async function atualizarStatus(id, status) {
  const { rows } = await query(
    `UPDATE usuarios SET status = $2 WHERE id = $1 RETURNING ${COLUNAS_PUBLICAS}`,
    [id, status]
  );
  return rows[0] ?? null;
}

import { query } from '../../db.js';

export async function inserir({ nome, email, mensagem }) {
  const { rows } = await query(
    'INSERT INTO contatos (nome, email, mensagem) VALUES ($1, $2, $3) RETURNING *',
    [nome, email, mensagem]
  );
  return rows[0];
}

export async function listarTodos() {
  const { rows } = await query('SELECT * FROM contatos ORDER BY criado_em DESC');
  return rows;
}

export async function marcarLida(id) {
  const { rows } = await query('UPDATE contatos SET lida = true WHERE id = $1 RETURNING *', [id]);
  return rows[0] ?? null;
}

export async function excluir(id) {
  const { rows } = await query('DELETE FROM contatos WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

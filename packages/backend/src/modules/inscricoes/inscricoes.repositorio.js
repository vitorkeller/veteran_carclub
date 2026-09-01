import { query } from '../../db.js';

/**
 * Busca o evento com FOR UPDATE: trava a linha até o fim da transação,
 * para que duas inscrições simultâneas não passem juntas pela checagem de capacidade.
 */
export async function buscarEventoParaAtualizar(eventoId, executor) {
  const { rows } = await executor.query('SELECT * FROM eventos WHERE id = $1 FOR UPDATE', [eventoId]);
  return rows[0] ?? null;
}

export async function contarConfirmadas(eventoId, executor) {
  const { rows } = await executor.query(
    `SELECT count(*)::int AS total FROM inscricoes WHERE evento_id = $1 AND status = 'confirmada'`,
    [eventoId]
  );
  return rows[0].total;
}

export async function inserir({ eventoId, usuarioId, veiculoId, tipo, codigoCheckin }, executor) {
  const { rows } = await executor.query(
    `INSERT INTO inscricoes (evento_id, usuario_id, veiculo_id, tipo, codigo_checkin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [eventoId, usuarioId, veiculoId ?? null, tipo, codigoCheckin]
  );
  return rows[0];
}

export async function listarPorUsuario(usuarioId) {
  const { rows } = await query(
    `SELECT i.*, e.nome AS evento_nome, e.data_evento
     FROM inscricoes i JOIN eventos e ON e.id = i.evento_id
     WHERE i.usuario_id = $1 ORDER BY e.data_evento DESC`,
    [usuarioId]
  );
  return rows;
}

/**
 * Admin: todos os inscritos de um evento (visitantes e expositores), para o
 * Dashboard de Inscritos. Inclui documento e imagens do veículo (agregadas
 * via veiculo_imagens) para o admin conseguir avaliar a aprovação do
 * expositor sem sair da tela.
 */
export async function listarPorEvento(eventoId) {
  const { rows } = await query(
    `SELECT i.id AS inscricao_id, i.tipo, i.criado_em, i.checkin_em, i.codigo_checkin,
            u.id AS usuario_id, u.nome_completo, u.email, u.status AS usuario_status,
            v.id AS veiculo_id, v.nome AS veiculo_nome, v.modelo AS veiculo_modelo,
            v.ano AS veiculo_ano, v.modificacoes AS veiculo_modificacoes, v.documento_url AS veiculo_documento_url,
            COALESCE(
              (SELECT json_agg(vi.url ORDER BY vi.ordem, vi.id) FROM veiculo_imagens vi WHERE vi.veiculo_id = v.id),
              '[]'
            ) AS veiculo_imagens
     FROM inscricoes i
     JOIN usuarios u ON u.id = i.usuario_id
     LEFT JOIN veiculos v ON v.id = i.veiculo_id
     WHERE i.evento_id = $1
     ORDER BY i.criado_em ASC`,
    [eventoId]
  );
  return rows;
}

/** Admin: marca a inscrição como cancelada (usado quando o expositor é reprovado). */
export async function cancelar(inscricaoId) {
  const { rows } = await query(
    `UPDATE inscricoes SET status = 'cancelada' WHERE id = $1 RETURNING *`,
    [inscricaoId]
  );
  return rows[0] ?? null;
}

/** Check-in do admin na portaria: busca a inscrição confirmada por código dentro de UM evento específico. */
export async function buscarPorCodigoEEvento(eventoId, codigo) {
  const { rows } = await query(
    `SELECT i.id AS inscricao_id, i.tipo, i.status, i.checkin_em,
            u.nome_completo, v.nome AS veiculo_nome
     FROM inscricoes i
     JOIN usuarios u ON u.id = i.usuario_id
     LEFT JOIN veiculos v ON v.id = i.veiculo_id
     WHERE i.evento_id = $1 AND i.codigo_checkin = $2`,
    [eventoId, codigo]
  );
  return rows[0] ?? null;
}

export async function registrarCheckin(inscricaoId) {
  const { rows } = await query(
    `UPDATE inscricoes SET checkin_em = now() WHERE id = $1 RETURNING checkin_em`,
    [inscricaoId]
  );
  return rows[0] ?? null;
}

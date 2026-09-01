import { query } from '../../db.js';

export async function inserir({
  nome, descricao, dataEvento, horarioInicio, horarioTermino, local, capacidadeMaxima, imagemCapaUrl,
}) {
  const { rows } = await query(
    `INSERT INTO eventos (nome, descricao, data_evento, horario_inicio, horario_termino, local, capacidade_maxima, imagem_capa_url)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 600), $8)
     RETURNING *`,
    [nome, descricao ?? null, dataEvento, horarioInicio, horarioTermino, local ?? null, capacidadeMaxima ?? null, imagemCapaUrl ?? null]
  );
  return rows[0];
}

export async function listarProximos() {
  const { rows } = await query(
    `SELECT * FROM eventos WHERE data_evento >= CURRENT_DATE AND status != 'cancelado' ORDER BY data_evento ASC`
  );
  return rows;
}

export async function listarPassados() {
  const { rows } = await query(
    `SELECT * FROM eventos WHERE data_evento < CURRENT_DATE ORDER BY data_evento DESC`
  );
  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await query('SELECT * FROM eventos WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function atualizar(id, campos) {
  const colunas = Object.keys(campos);
  if (colunas.length === 0) return buscarPorId(id);

  const mapa = {
    nome: 'nome', descricao: 'descricao', dataEvento: 'data_evento', local: 'local',
    horarioInicio: 'horario_inicio', horarioTermino: 'horario_termino',
    capacidadeMaxima: 'capacidade_maxima', imagemCapaUrl: 'imagem_capa_url', status: 'status',
  };
  const sets = colunas.map((c, i) => `${mapa[c]} = $${i + 2}`).join(', ');
  const valores = colunas.map((c) => campos[c]);

  const { rows } = await query(`UPDATE eventos SET ${sets} WHERE id = $1 RETURNING *`, [id, ...valores]);
  return rows[0] ?? null;
}

export async function excluir(id) {
  const { rows } = await query('DELETE FROM eventos WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

/** Quantas inscrições confirmadas o evento tem -- usado como estimativa de comparecimento. */
export async function contarInscricoesConfirmadas(eventoId) {
  const { rows } = await query(
    `SELECT count(*)::int AS total FROM inscricoes WHERE evento_id = $1 AND status = 'confirmada'`,
    [eventoId]
  );
  return rows[0].total;
}

/** Carros que participaram do evento como expositor -- para a página de detalhe. */
export async function listarVeiculosParticipantes(eventoId) {
  const { rows } = await query(
    `SELECT v.id, v.nome, v.ano, u.nome_completo AS proprietario_nome
     FROM inscricoes i
     JOIN veiculos v ON v.id = i.veiculo_id
     JOIN usuarios u ON u.id = v.usuario_id
     WHERE i.evento_id = $1 AND i.tipo = 'expositor' AND i.status = 'confirmada'
     ORDER BY v.nome ASC`,
    [eventoId]
  );
  return rows;
}

/** Galeria de fotos de um evento já realizado -- até 50 imagens (checado na camada de serviço). */
export async function buscarGaleria(eventoId) {
  const { rows } = await query(
    'SELECT id, imagem_url, legenda FROM galeria_eventos WHERE evento_id = $1 ORDER BY criado_em ASC',
    [eventoId]
  );
  return rows;
}

export async function contarImagensGaleria(eventoId) {
  const { rows } = await query('SELECT count(*)::int AS total FROM galeria_eventos WHERE evento_id = $1', [eventoId]);
  return rows[0].total;
}

export async function inserirImagensGaleria(eventoId, urls) {
  const { rows } = await query(
    `INSERT INTO galeria_eventos (evento_id, imagem_url)
     SELECT $1, unnest($2::text[])
     RETURNING id, imagem_url, legenda`,
    [eventoId, urls]
  );
  return rows;
}

export async function excluirImagemGaleria(imagemId) {
  const { rows } = await query('DELETE FROM galeria_eventos WHERE id = $1 RETURNING id', [imagemId]);
  return rows.length > 0;
}

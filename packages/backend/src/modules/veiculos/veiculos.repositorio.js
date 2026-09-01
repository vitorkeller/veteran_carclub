import { query } from '../../db.js';

export async function inserir({ usuarioId, nome, modelo, ano, documentoUrl, modificacoes }, executor = { query }) {
  const { rows } = await executor.query(
    `INSERT INTO veiculos (usuario_id, nome, modelo, ano, documento_url, modificacoes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [usuarioId, nome, modelo, ano, documentoUrl ?? null, modificacoes ?? null]
  );
  return rows[0];
}

const SELECT_ACERVO = `
  SELECT
    v.id, v.nome, v.modelo, v.ano, v.modificacoes, v.publicado_acervo,
    u.nome_completo AS proprietario_nome,
    u.instagram AS proprietario_instagram,
    COALESCE(
      json_agg(DISTINCT e.nome) FILTER (WHERE e.nome IS NOT NULL),
      '[]'
    ) AS eventos,
    COALESCE(
      (SELECT json_agg(vi.url ORDER BY vi.ordem, vi.id) FROM veiculo_imagens vi WHERE vi.veiculo_id = v.id),
      '[]'
    ) AS imagens
  FROM veiculos v
  JOIN usuarios u ON u.id = v.usuario_id
  LEFT JOIN inscricoes i ON i.veiculo_id = v.id AND i.status = 'confirmada'
  LEFT JOIN eventos e ON e.id = i.evento_id
`;

/**
 * Acervo público: só veículos com `publicado_acervo = true` (curadoria do
 * admin), com o dono, as imagens e a lista de eventos (tags) em que já
 * participou.
 */
export async function listarAcervo() {
  const { rows } = await query(`
    ${SELECT_ACERVO}
    WHERE v.publicado_acervo = true
    GROUP BY v.id, u.nome_completo, u.instagram
    ORDER BY v.criado_em DESC
  `);
  return rows;
}

const SELECT_ACERVO_ADMIN = `
  SELECT
    v.id, v.nome, v.modelo, v.ano, v.modificacoes, v.publicado_acervo,
    u.nome_completo AS proprietario_nome,
    u.instagram AS proprietario_instagram,
    COALESCE(
      json_agg(DISTINCT e.nome) FILTER (WHERE e.nome IS NOT NULL),
      '[]'
    ) AS eventos,
    -- Diferente do acervo público: aqui vem {id, url} de cada imagem, para o
    -- admin conseguir excluir uma foto específica (precisa do id).
    COALESCE(
      (SELECT json_agg(json_build_object('id', vi.id, 'url', vi.url) ORDER BY vi.ordem, vi.id)
       FROM veiculo_imagens vi WHERE vi.veiculo_id = v.id),
      '[]'
    ) AS imagens
  FROM veiculos v
  JOIN usuarios u ON u.id = v.usuario_id
  LEFT JOIN inscricoes i ON i.veiculo_id = v.id AND i.status = 'confirmada'
  LEFT JOIN eventos e ON e.id = i.evento_id
`;

/** Admin: todos os veículos (publicados ou não), para a tela de curadoria. */
export async function listarTodosAdmin() {
  const { rows } = await query(`
    ${SELECT_ACERVO_ADMIN}
    GROUP BY v.id, u.nome_completo, u.instagram
    ORDER BY v.criado_em DESC
  `);
  return rows;
}

export async function buscarPorId(id, executor = { query }) {
  const { rows } = await executor.query(
    `SELECT v.*, u.nome_completo AS proprietario_nome, u.instagram AS proprietario_instagram
     FROM veiculos v JOIN usuarios u ON u.id = v.usuario_id
     WHERE v.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/** Veículo + imagens, para o modal público do Acervo (só se publicado). */
export async function buscarAcervoPorId(id) {
  const { rows } = await query(`${SELECT_ACERVO} WHERE v.id = $1 AND v.publicado_acervo = true GROUP BY v.id, u.nome_completo, u.instagram`, [id]);
  return rows[0] ?? null;
}

export async function listarPorUsuario(usuarioId) {
  const { rows } = await query('SELECT * FROM veiculos WHERE usuario_id = $1 ORDER BY criado_em DESC', [usuarioId]);
  return rows;
}

export async function atualizar(id, campos) {
  const mapa = {
    nome: 'nome', modelo: 'modelo', ano: 'ano', modificacoes: 'modificacoes',
    documentoUrl: 'documento_url', imagemUrl: 'imagem_url', publicadoAcervo: 'publicado_acervo',
  };
  const colunas = Object.keys(campos).filter((c) => mapa[c]);
  if (colunas.length === 0) return buscarPorId(id);

  const sets = colunas.map((c, i) => `${mapa[c]} = $${i + 2}`).join(', ');
  const valores = colunas.map((c) => campos[c]);

  const { rows } = await query(`UPDATE veiculos SET ${sets} WHERE id = $1 RETURNING *`, [id, ...valores]);
  return rows[0] ?? null;
}

export async function excluir(id) {
  const { rows } = await query('DELETE FROM veiculos WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

// --- Imagens do veículo (até 10, checado na camada de serviço) ---

export async function contarImagens(veiculoId, executor = { query }) {
  const { rows } = await executor.query('SELECT count(*)::int AS total FROM veiculo_imagens WHERE veiculo_id = $1', [veiculoId]);
  return rows[0].total;
}

export async function inserirImagens(veiculoId, urls, executor = { query }) {
  const { rows } = await executor.query(
    `INSERT INTO veiculo_imagens (veiculo_id, url, ordem)
     SELECT $1, valor, COALESCE((SELECT MAX(ordem) + 1 FROM veiculo_imagens WHERE veiculo_id = $1), 0) + ordinalidade - 1
     FROM unnest($2::text[]) WITH ORDINALITY AS t(valor, ordinalidade)
     RETURNING id, url, ordem`,
    [veiculoId, urls]
  );
  return rows;
}

export async function excluirImagem(imagemId) {
  const { rows } = await query('DELETE FROM veiculo_imagens WHERE id = $1 RETURNING id', [imagemId]);
  return rows.length > 0;
}

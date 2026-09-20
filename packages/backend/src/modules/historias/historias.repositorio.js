import { query, transacao } from '../../db.js';

const SELECT_BASE = `
  SELECT h.id, h.titulo, h.conteudo, h.imagem_url, h.destaque, h.criado_em,
         COALESCE(h.autor_nome, u.nome_completo) AS autor_nome,
         h.evento_id, h.usuario_id,
         e.nome AS evento_nome, e.data_evento AS evento_data, e.local AS evento_local,
         e.imagem_capa_url AS evento_imagem_capa_url
  FROM historias h
  LEFT JOIN usuarios u ON u.id = h.usuario_id
  LEFT JOIN eventos e ON e.id = h.evento_id
`;

export async function inserir({ titulo, conteudo, imagemUrl, autorNome, usuarioId, eventoId, destaque }) {
  const { rows } = await query(
    `INSERT INTO historias (titulo, conteudo, imagem_url, autor_nome, usuario_id, evento_id, destaque)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, false))
     RETURNING *`,
    [titulo, conteudo, imagemUrl ?? null, autorNome ?? null, usuarioId ?? null, eventoId, destaque ?? null]
  );
  return rows[0];
}

/** Página pública de Histórias: lista tudo, mais recente primeiro. */
export async function listarTodas() {
  const { rows } = await query(`${SELECT_BASE} ORDER BY h.criado_em DESC`);
  return rows;
}

/** Home page: só as marcadas como destaque. */
export async function listarDestaque() {
  const { rows } = await query(`${SELECT_BASE} WHERE h.destaque = true ORDER BY h.criado_em DESC`);
  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await query(`${SELECT_BASE} WHERE h.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function atualizar(id, campos) {
  const mapa = {
    titulo: 'titulo', conteudo: 'conteudo', imagemUrl: 'imagem_url', autorNome: 'autor_nome',
    usuarioId: 'usuario_id', eventoId: 'evento_id', destaque: 'destaque',
  };
  const colunas = Object.keys(campos).filter((c) => mapa[c]);
  if (colunas.length === 0) return buscarPorId(id);

  const sets = colunas.map((c, i) => `${mapa[c]} = $${i + 2}`).join(', ');
  const valores = colunas.map((c) => campos[c]);

  const { rows } = await query(`UPDATE historias SET ${sets} WHERE id = $1 RETURNING *`, [id, ...valores]);
  return rows[0] ?? null;
}

export async function excluir(id) {
  const { rows } = await query('DELETE FROM historias WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

/** Busca a história mais recente vinculada a um evento (usado no detalhe público do evento). */
export async function buscarPorEventoId(eventoId) {
  const { rows } = await query(`${SELECT_BASE} WHERE h.evento_id = $1 ORDER BY h.criado_em DESC LIMIT 1`, [eventoId]);
  return rows[0] ?? null;
}

/** IDs dos veículos já marcados como destaque nesta história (pré-marca os checkboxes no admin). */
export async function listarVeiculosDestaqueIds(historiaId) {
  const { rows } = await query('SELECT veiculo_id FROM historia_veiculos_destaque WHERE historia_id = $1', [historiaId]);
  return rows.map((r) => r.veiculo_id);
}

/** Veículos em destaque com ficha completa (fotos, descrição, dono) — para exibição pública. */
export async function listarVeiculosDestaque(historiaId) {
  const { rows } = await query(
    `SELECT v.id, v.nome, v.modelo, v.ano, v.modificacoes,
            u.nome_completo AS proprietario_nome,
            COALESCE(
              (SELECT json_agg(vi.url ORDER BY vi.ordem, vi.id) FROM veiculo_imagens vi WHERE vi.veiculo_id = v.id),
              '[]'
            ) AS imagens
     FROM historia_veiculos_destaque hvd
     JOIN veiculos v ON v.id = hvd.veiculo_id
     JOIN usuarios u ON u.id = v.usuario_id
     WHERE hvd.historia_id = $1
     ORDER BY hvd.criado_em ASC`,
    [historiaId]
  );
  return rows;
}

/** Substitui a seleção de veículos em destaque desta história (delete-then-insert transacional). */
export async function definirVeiculosDestaque(historiaId, veiculoIds) {
  await transacao(async (t) => {
    await t.query('DELETE FROM historia_veiculos_destaque WHERE historia_id = $1', [historiaId]);
    if (veiculoIds.length > 0) {
      await t.query(
        `INSERT INTO historia_veiculos_destaque (historia_id, veiculo_id)
         SELECT $1, unnest($2::int[])`,
        [historiaId, veiculoIds]
      );
    }
  });
}

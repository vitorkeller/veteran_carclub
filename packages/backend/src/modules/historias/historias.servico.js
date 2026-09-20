import { z } from 'zod';
import { ErroHttp } from '../../utils/ErroHttp.js';
import * as historiasRepo from './historias.repositorio.js';

const esquemaCriacao = z.object({
  titulo: z.string().trim().min(3, 'Informe um título para a história'),
  conteudo: z.string().trim().min(10, 'Conte um pouco mais — o texto está curto demais'),
  imagemUrl: z.string().trim().url().optional(),
  autorNome: z.string().trim().optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  // Novo conceito: toda história é o recorte/resumo de um evento passado.
  eventoId: z.coerce.number().int().positive('Selecione o evento que esta história resume'),
  destaque: z.coerce.boolean().optional(),
  // Curadoria: quais dos veículos participantes do evento ganham destaque
  // (com fotos e descrição) nesta história. Vazio/ausente = nenhum.
  veiculosDestaqueIds: z.array(z.coerce.number().int().positive()).optional(),
});

const esquemaAtualizacao = esquemaCriacao.partial().extend({
  // eventoId não fica opcional na criação, mas numa edição pontual (ex.: só
  // mudando o destaque) não precisa ser reenviado.
  eventoId: z.coerce.number().int().positive().optional(),
});

/** Admin: cadastra uma história como recorte/resumo de um evento já realizado. */
export async function criar(payload) {
  const { veiculosDestaqueIds, ...dados } = esquemaCriacao.parse(payload);
  const historia = await historiasRepo.inserir(dados);
  if (veiculosDestaqueIds) {
    await historiasRepo.definirVeiculosDestaque(historia.id, veiculosDestaqueIds);
  }
  // Retorna já com o autor_nome resolvido (via JOIN), pronto para exibir na UI
  // que acabou de criar o registro, sem precisar de uma segunda chamada.
  return historiasRepo.buscarPorId(historia.id);
}

export async function atualizar(id, payload) {
  const { veiculosDestaqueIds, ...dados } = esquemaAtualizacao.parse(payload);
  const atualizou = await historiasRepo.atualizar(id, dados);
  if (!atualizou) throw new ErroHttp(404, 'História não encontrada');
  if (veiculosDestaqueIds) {
    await historiasRepo.definirVeiculosDestaque(id, veiculosDestaqueIds);
  }
  return historiasRepo.buscarPorId(id);
}

export async function excluir(id) {
  const excluiu = await historiasRepo.excluir(id);
  if (!excluiu) throw new ErroHttp(404, 'História não encontrada');
}

/** Inclui os IDs dos veículos já destacados — usado para pré-marcar os checkboxes na edição. */
export async function buscarPorId(id) {
  const historia = await historiasRepo.buscarPorId(id);
  if (!historia) throw new ErroHttp(404, 'História não encontrada');
  historia.veiculos_destaque_ids = await historiasRepo.listarVeiculosDestaqueIds(id);
  return historia;
}

/** Página pública de Histórias. */
export async function listarTodas() {
  return historiasRepo.listarTodas();
}

/** Home page: só destaques. */
export async function listarDestaque() {
  return historiasRepo.listarDestaque();
}

import { z } from 'zod';
import { ErroHttp } from '../../utils/ErroHttp.js';
import * as eventosRepo from './eventos.repositorio.js';
import * as historiasRepo from '../historias/historias.repositorio.js';

const MAX_IMAGENS_GALERIA = 50;
const horario = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato HH:MM');

// `cidade` não é um campo aceito na entrada: a regra de negócio é que todo
// evento do clube acontece em Joinville, então isso já é o DEFAULT da coluna
// no banco (ver db.js) e nunca fica exposto para o cliente decidir.
const esquemaCriacao = z
  .object({
    nome: z.string().trim().min(3, 'Informe o nome do evento'),
    descricao: z.string().trim().optional(),
    dataEvento: z.string().date('Data inválida, use o formato AAAA-MM-DD'),
    horarioInicio: horario,
    horarioTermino: horario,
    local: z.string().trim().optional(),
    capacidadeMaxima: z.coerce.number().int().min(1).max(600).optional(),
    imagemCapaUrl: z.string().trim().url().optional(),
  })
  .refine((dados) => dados.horarioTermino > dados.horarioInicio, {
    message: 'O horário de término precisa ser depois do horário de início',
    path: ['horarioTermino'],
  });

const esquemaAtualizacao = z
  .object({
    nome: z.string().trim().min(3).optional(),
    descricao: z.string().trim().optional(),
    dataEvento: z.string().date().optional(),
    horarioInicio: horario.optional(),
    horarioTermino: horario.optional(),
    local: z.string().trim().optional(),
    capacidadeMaxima: z.coerce.number().int().min(1).max(600).optional(),
    imagemCapaUrl: z.string().trim().url().optional(),
    status: z.enum(['agendado', 'realizado', 'cancelado']).optional(),
    // Nota: não existe mais campo `presentes` editável pelo admin — o
    // comparecimento é sempre calculado a partir das inscrições confirmadas
    // (ver buscarPorId), nunca digitado manualmente.
  })
  .refine(
    (dados) => !dados.horarioInicio || !dados.horarioTermino || dados.horarioTermino > dados.horarioInicio,
    { message: 'O horário de término precisa ser depois do horário de início', path: ['horarioTermino'] }
  );

/** Admin: cria um evento. A UNIQUE em data_evento já garante "1 evento por dia" no banco. */
export async function criar(payload) {
  const dados = esquemaCriacao.parse(payload);
  return eventosRepo.inserir(dados);
}

export async function atualizar(id, payload) {
  const dados = esquemaAtualizacao.parse(payload);
  const evento = await eventosRepo.atualizar(id, dados);
  if (!evento) throw new ErroHttp(404, 'Evento não encontrado');
  return evento;
}

export async function excluir(id) {
  const excluiu = await eventosRepo.excluir(id);
  if (!excluiu) throw new ErroHttp(404, 'Evento não encontrado');
}

function jaAconteceu(dataEvento) {
  // Defensivo: não assume que o driver sempre devolve string (o bug relatado
  // pelo usuário era exatamente uma suposição dessas quebrando em produção).
  const dataStr = typeof dataEvento === 'string' ? dataEvento.slice(0, 10) : new Date(dataEvento).toISOString().slice(0, 10);
  return dataStr < new Date().toISOString().slice(0, 10);
}

/**
 * Detalhe do evento. Para eventos passados, inclui a galeria de fotos, os
 * carros que participaram como expositores, o comparecimento (sempre
 * calculado a partir das inscrições confirmadas — nunca um valor digitado
 * manualmente) e, se existir, a história vinculada com os veículos que o
 * admin colocou em destaque (com fotos e descrição).
 */
export async function buscarPorId(id) {
  const evento = await eventosRepo.buscarPorId(id);
  if (!evento) throw new ErroHttp(404, 'Evento não encontrado');

  if (jaAconteceu(evento.data_evento)) {
    const [galeria, veiculosParticipantes, presentes, historia] = await Promise.all([
      eventosRepo.buscarGaleria(id),
      eventosRepo.listarVeiculosParticipantes(id),
      eventosRepo.contarInscricoesConfirmadas(id),
      historiasRepo.buscarPorEventoId(id),
    ]);
    evento.galeria = galeria;
    evento.veiculos_participantes = veiculosParticipantes;
    evento.presentes = presentes;
    evento.historia = historia ? { id: historia.id, titulo: historia.titulo, conteudo: historia.conteudo } : null;
    evento.veiculos_destaque = historia ? await historiasRepo.listarVeiculosDestaque(historia.id) : [];
  }

  return evento;
}

/** Agenda de Eventos: futuros com inscrição aberta + passados com histórico. */
export async function listarAgenda() {
  const [proximos, passados] = await Promise.all([
    eventosRepo.listarProximos(),
    eventosRepo.listarPassados(),
  ]);
  return { proximos, passados };
}

/** Home page: 1 destaque (o próximo evento) — sempre em Joinville, sempre único no dia. */
export async function listarDestaque() {
  const proximos = await eventosRepo.listarProximos();
  return proximos.slice(0, 3);
}

/** Admin: adiciona fotos à galeria de um evento (limite de 50 no total). */
export async function adicionarImagensGaleria(eventoId, urls) {
  const evento = await eventosRepo.buscarPorId(eventoId);
  if (!evento) throw new ErroHttp(404, 'Evento não encontrado');
  if (!Array.isArray(urls) || urls.length === 0) throw new ErroHttp(400, 'Nenhuma imagem informada');

  const atuais = await eventosRepo.contarImagensGaleria(eventoId);
  if (atuais + urls.length > MAX_IMAGENS_GALERIA) {
    throw new ErroHttp(400, `Este evento já tem ${atuais} imagens; o limite é ${MAX_IMAGENS_GALERIA} por evento.`);
  }

  return eventosRepo.inserirImagensGaleria(eventoId, urls);
}

export async function removerImagemGaleria(imagemId) {
  const removeu = await eventosRepo.excluirImagemGaleria(imagemId);
  if (!removeu) throw new ErroHttp(404, 'Imagem não encontrada');
}

/**
 * Admin: lista os veículos inscritos como expositores neste evento — usada
 * na tela de Histórias para escolher quais carros ganham destaque no resumo.
 */
export async function listarParticipantes(id) {
  const evento = await eventosRepo.buscarPorId(id);
  if (!evento) throw new ErroHttp(404, 'Evento não encontrado');
  return eventosRepo.listarVeiculosParticipantes(id);
}

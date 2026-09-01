import { z } from 'zod';
import { transacao } from '../../db.js';
import { ErroHttp } from '../../utils/ErroHttp.js';
import { gerarCodigoCheckin } from '../../utils/codigoCheckin.js';
import * as inscricoesRepo from './inscricoes.repositorio.js';
import * as veiculosRepo from '../veiculos/veiculos.repositorio.js';

const esquema = z.object({
  eventoId: z.coerce.number().int().positive(),
  veiculoId: z.coerce.number().int().positive().optional(), // só para expositor
});

/**
 * Regra de negócio: capacidade rígida de até `capacidade_maxima` (máx. 600) por evento.
 * Trava a linha do evento (FOR UPDATE) para que inscrições concorrentes não furem o limite.
 */
export async function inscrever(usuario, payload) {
  const { eventoId, veiculoId } = esquema.parse(payload);

  return transacao(async (t) => {
    const evento = await inscricoesRepo.buscarEventoParaAtualizar(eventoId, t);
    if (!evento) throw new ErroHttp(404, 'Evento não encontrado');
    if (evento.status === 'cancelado') throw new ErroHttp(400, 'Este evento foi cancelado');

    const confirmadas = await inscricoesRepo.contarConfirmadas(eventoId, t);
    if (confirmadas >= evento.capacidade_maxima) {
      throw new ErroHttp(409, 'Este evento atingiu a capacidade máxima de inscrições');
    }

    // Expositor deve informar um veículo seu; visitante não usa esse campo.
    let veiculoValidadoId = null;
    if (usuario.tipo === 'expositor') {
      if (!veiculoId) throw new ErroHttp(400, 'Informe o veículo que será exibido no evento');
      const veiculo = await veiculosRepo.buscarPorId(veiculoId, t);
      if (!veiculo || veiculo.usuario_id !== usuario.id) {
        throw new ErroHttp(403, 'Esse veículo não pertence ao usuário autenticado');
      }
      veiculoValidadoId = veiculoId;
    }

    return inscricoesRepo.inserir(
      { eventoId, usuarioId: usuario.id, veiculoId: veiculoValidadoId, tipo: usuario.tipo, codigoCheckin: gerarCodigoCheckin() },
      t
    );
  });
}

export async function listarMinhas(usuarioId) {
  return inscricoesRepo.listarPorUsuario(usuarioId);
}

/** Admin: todos os inscritos de um evento — base do Dashboard de Inscritos. */
export async function listarPorEvento(eventoId) {
  return inscricoesRepo.listarPorEvento(eventoId);
}

const esquemaCheckin = z.object({
  codigo: z.string().trim().min(1, 'Informe o código de check-in'),
});

/**
 * Check-in na portaria: admin digita o código apresentado pela pessoa.
 * Válido só dentro do evento correto, uma vez só.
 */
export async function fazerCheckin(eventoId, payload) {
  const { codigo } = esquemaCheckin.parse(payload);
  const codigoNormalizado = codigo.trim().toUpperCase();

  const inscricao = await inscricoesRepo.buscarPorCodigoEEvento(eventoId, codigoNormalizado);
  if (!inscricao) throw new ErroHttp(404, 'Código inválido para este evento');
  if (inscricao.status !== 'confirmada') {
    throw new ErroHttp(400, 'Esta inscrição não está confirmada (foi cancelada ou reprovada)');
  }
  if (inscricao.checkin_em) {
    throw new ErroHttp(409, `Este código já fez check-in às ${new Date(inscricao.checkin_em).toLocaleTimeString('pt-BR')}`);
  }

  const resultado = await inscricoesRepo.registrarCheckin(inscricao.inscricao_id);
  return {
    nomeCompleto: inscricao.nome_completo,
    tipo: inscricao.tipo,
    veiculoNome: inscricao.veiculo_nome,
    checkinEm: resultado.checkin_em,
  };
}

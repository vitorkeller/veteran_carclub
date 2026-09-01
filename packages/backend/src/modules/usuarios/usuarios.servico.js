import { z } from 'zod';
import { transacao } from '../../db.js';
import { ErroHttp } from '../../utils/ErroHttp.js';
import { gerarHash, conferir } from '../../utils/senha.js';
import { gerarToken } from '../../utils/token.js';
import { gerarCodigoCheckin } from '../../utils/codigoCheckin.js';
import { enviarEmail } from '../../services/email.js';
import {
  emailConfirmacaoVisitante,
  emailFilaDeEsperaExpositor,
  emailAprovacaoExpositor,
  emailReprovacaoExpositor,
} from '../../services/emailTemplates.js';
import * as usuariosRepo from './usuarios.repositorio.js';
import * as veiculosRepo from '../veiculos/veiculos.repositorio.js';
import * as inscricoesRepo from '../inscricoes/inscricoes.repositorio.js';
import * as eventosRepo from '../eventos/eventos.repositorio.js';

// A inscrição sempre acontece no contexto de um evento específico — não existe
// mais cadastro "solto" sem evento (ver Navbar/Hero: o botão de inscrição só
// aparece dentro do card/detalhe de um evento futuro).
const campoEvento = { eventoId: z.coerce.number().int().positive('Selecione o evento em que deseja se inscrever') };

// Fluxo 1 (visitante): nome, e-mail e Instagram (opcional). Sem senha — não
// existe login de usuário final, só o admin loga no painel; guardar senha
// de quem nunca vai usá-la seria um risco de segurança desnecessário.
// Aprovação automática.
const esquemaVisitante = z.object({
  tipo: z.literal('visitante'),
  nomeCompleto: z.string().trim().min(3, 'Informe o nome completo'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  instagram: z.string().trim().optional(),
  ...campoEvento,
});

// Fluxo 2 (expositor): os mesmos dados + documento e ficha técnica do
// veículo. Continua exigindo aprovação manual do admin.
const esquemaExpositor = esquemaVisitante.extend({
  tipo: z.literal('expositor'),
  veiculo: z.object({
    nome: z.string().trim().min(1, 'Dê um nome/apelido para o veículo'),
    modelo: z.string().trim().min(1, 'Informe o modelo do veículo'),
    ano: z.coerce.number().int().min(1885).max(new Date().getFullYear() + 1),
    documentoUrl: z.string().trim().url('Envie o documento do veículo antes de cadastrar'),
    modificacoes: z.string().trim().optional(),
    imagens: z.array(z.string().trim().url()).max(10, 'No máximo 10 imagens por veículo').optional(),
  }),
});

const esquemaRegistro = z.discriminatedUnion('tipo', [esquemaVisitante, esquemaExpositor]);

/**
 * Cadastro + inscrição no evento em uma única ação atômica: visitante e
 * expositor sempre se cadastram "para" um evento específico (regra de
 * negócio: não existe mais entrada genérica de inscrição fora do contexto de
 * um evento).
 *
 * Regra de aprovação: visitante é aprovado automaticamente e já recebe o
 * código de check-in por e-mail; expositor entra em análise (e-mail de
 * "fila de espera") até o admin validar o documento do veículo.
 */
export async function registrar(payload) {
  const dados = esquemaRegistro.parse(payload);

  const existente = await usuariosRepo.buscarPorEmail(dados.email);
  if (existente) {
    throw new ErroHttp(
      409,
      'Este e-mail já tem um cadastro no clube. Se você já se inscreveu antes e quer participar de um novo evento, entre em contato com a organização.'
    );
  }

  const statusInicial = dados.tipo === 'visitante' ? 'aprovado' : 'pendente';
  const codigoCheckin = gerarCodigoCheckin();

  const resultado = await transacao(async (t) => {
    // Trava a linha do evento (mesmo mecanismo usado em inscricoes.servico):
    // evita que duas inscrições simultâneas furem a capacidade máxima.
    const evento = await inscricoesRepo.buscarEventoParaAtualizar(dados.eventoId, t);
    if (!evento) throw new ErroHttp(404, 'Evento não encontrado');
    if (evento.status === 'cancelado') throw new ErroHttp(400, 'Este evento foi cancelado');

    const confirmadas = await inscricoesRepo.contarConfirmadas(dados.eventoId, t);
    if (confirmadas >= evento.capacidade_maxima) {
      throw new ErroHttp(409, 'Este evento atingiu a capacidade máxima de inscrições');
    }

    const novoUsuario = await usuariosRepo.inserir(
      {
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        instagram: dados.instagram,
        tipo: dados.tipo,
        status: statusInicial,
      },
      t
    );

    let veiculo = null;
    if (dados.tipo === 'expositor') {
      veiculo = await veiculosRepo.inserir(
        {
          usuarioId: novoUsuario.id,
          nome: dados.veiculo.nome,
          modelo: dados.veiculo.modelo,
          ano: dados.veiculo.ano,
          documentoUrl: dados.veiculo.documentoUrl,
          modificacoes: dados.veiculo.modificacoes,
        },
        t
      );
      if (dados.veiculo.imagens?.length) {
        await veiculosRepo.inserirImagens(veiculo.id, dados.veiculo.imagens, t);
      }
    }

    await inscricoesRepo.inserir(
      { eventoId: dados.eventoId, usuarioId: novoUsuario.id, veiculoId: veiculo?.id ?? null, tipo: dados.tipo, codigoCheckin },
      t
    );

    return novoUsuario;
  });

  // Envio de e-mail fora da transação: uma falha de e-mail não deve desfazer
  // um cadastro que já foi salvo com sucesso no banco.
  try {
    const evento = await eventosRepo.buscarPorId(dados.eventoId);
    if (dados.tipo === 'visitante') {
      const { assunto, texto } = emailConfirmacaoVisitante({ nomeCompleto: dados.nomeCompleto, evento, codigoCheckin });
      await enviarEmail({ para: dados.email, assunto, texto });
    } else {
      const { assunto, texto } = emailFilaDeEsperaExpositor({ nomeCompleto: dados.nomeCompleto, evento });
      await enviarEmail({ para: dados.email, assunto, texto });
    }
  } catch (erro) {
    console.error('[usuarios] Falha ao enviar e-mail de confirmação de inscrição:', erro.message);
  }

  return resultado;
}

const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email(),
  senha: z.string().min(1),
});

/** Login: só faz sentido para administradores — visitantes/expositores não têm senha. */
export async function login(payload) {
  const { email, senha } = esquemaLogin.parse(payload);

  const usuario = await usuariosRepo.buscarPorEmail(email);
  // Mensagem genérica de propósito: não revela se o e-mail existe ou não.
  if (!usuario || !usuario.senha_hash || !(await conferir(senha, usuario.senha_hash))) {
    throw new ErroHttp(401, 'E-mail ou senha inválidos');
  }

  const token = gerarToken(usuario);
  const { senha_hash, ...usuarioPublico } = usuario; // eslint-disable-line no-unused-vars
  return { token, usuario: usuarioPublico };
}

/** Admin: lista quem está esperando aprovação (expositores recém-cadastrados). */
export async function listarPendentes() {
  return usuariosRepo.listarPorStatus('pendente');
}

/**
 * Admin: aprova ou rejeita o cadastro de um expositor.
 * - Aprovado: envia e-mail #2 com o código de check-in (já gerado na inscrição).
 * - Rejeitado: cancela a inscrição (libera a vaga) e envia e-mail #2 de
 *   reprovação. Como o e-mail já tem cadastro (bloqueado por UNIQUE),
 *   a pessoa não consegue se inscrever de novo nesse mesmo evento.
 */
export async function definirStatus(id, status) {
  if (!['aprovado', 'rejeitado'].includes(status)) {
    throw new ErroHttp(400, 'Status inválido: use "aprovado" ou "rejeitado"');
  }

  const usuario = await usuariosRepo.atualizarStatus(id, status);
  if (!usuario) throw new ErroHttp(404, 'Usuário não encontrado');

  if (usuario.tipo === 'expositor') {
    try {
      const inscricoes = await inscricoesRepo.listarPorUsuario(usuario.id);
      const inscricao = inscricoes[0];
      if (inscricao) {
        const evento = { nome: inscricao.evento_nome, data_evento: inscricao.data_evento };
        if (status === 'aprovado') {
          const { assunto, texto } = emailAprovacaoExpositor({
            nomeCompleto: usuario.nome_completo,
            evento,
            codigoCheckin: inscricao.codigo_checkin,
          });
          await enviarEmail({ para: usuario.email, assunto, texto });
        } else {
          await inscricoesRepo.cancelar(inscricao.id);
          const { assunto, texto } = emailReprovacaoExpositor({ nomeCompleto: usuario.nome_completo, evento });
          await enviarEmail({ para: usuario.email, assunto, texto });
        }
      }
    } catch (erro) {
      console.error('[usuarios] Falha ao processar e-mail de aprovação/reprovação:', erro.message);
    }
  }

  return usuario;
}

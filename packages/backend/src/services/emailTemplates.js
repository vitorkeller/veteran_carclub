import { formatarDataLongaPtBr } from '../utils/data.js';

function assinatura() {
  return '\n\nAté lá!\nVeteran Carclub — Joinville, SC';
}

/** Visitante: aprovação é automática, então a confirmação já sai com o código de check-in. */
export function emailConfirmacaoVisitante({ nomeCompleto, evento, codigoCheckin }) {
  return {
    assunto: `Inscrição confirmada — ${evento.nome}`,
    texto:
      `Olá, ${nomeCompleto}!\n\n` +
      `Sua inscrição em "${evento.nome}" (${formatarDataLongaPtBr(evento.data_evento)}) está confirmada.\n\n` +
      `Seu código de check-in é: ${codigoCheckin}\n\n` +
      `Apresente esse código na portaria no dia do evento.` +
      assinatura(),
  };
}

/** Expositor: e-mail #1, avisando que o cadastro entrou em análise (aguardando aprovação do admin). */
export function emailFilaDeEsperaExpositor({ nomeCompleto, evento }) {
  return {
    assunto: `Cadastro em análise — ${evento.nome}`,
    texto:
      `Olá, ${nomeCompleto}!\n\n` +
      `Recebemos sua inscrição como expositor em "${evento.nome}" (${formatarDataLongaPtBr(evento.data_evento)}).\n\n` +
      `O documento e a ficha do seu veículo estão em análise pela organização do clube. ` +
      `Você recebe um novo e-mail assim que a análise for concluída.` +
      assinatura(),
  };
}

/** Expositor: e-mail #2 (aprovado) — parabeniza e já envia o código de check-in. */
export function emailAprovacaoExpositor({ nomeCompleto, evento, codigoCheckin }) {
  return {
    assunto: `Inscrição aprovada! — ${evento.nome}`,
    texto:
      `Parabéns, ${nomeCompleto}!\n\n` +
      `Seu cadastro como expositor em "${evento.nome}" (${formatarDataLongaPtBr(evento.data_evento)}) foi aprovado.\n\n` +
      `Seu código de check-in é: ${codigoCheckin}\n\n` +
      `Apresente esse código na portaria no dia do evento.` +
      assinatura(),
  };
}

/** Expositor: e-mail #2 (reprovado) — informa o cancelamento, sem código de check-in. */
export function emailReprovacaoExpositor({ nomeCompleto, evento }) {
  return {
    assunto: `Sobre sua inscrição — ${evento.nome}`,
    texto:
      `Olá, ${nomeCompleto}.\n\n` +
      `Depois de analisar o cadastro, não foi possível aprovar sua inscrição como expositor em ` +
      `"${evento.nome}" (${formatarDataLongaPtBr(evento.data_evento)}) desta vez.\n\n` +
      `Se tiver dúvidas sobre o motivo, entre em contato com a organização do clube.` +
      assinatura(),
  };
}

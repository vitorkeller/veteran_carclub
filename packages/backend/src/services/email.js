import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const smtpConfigurado = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

let transportador;
function obterTransportador() {
  if (!transportador) {
    transportador = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
  }
  return transportador;
}

/**
 * Envia um e-mail via SMTP. Sem `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`
 * configurados no .env, cai em "modo simulação": registra no console o que
 * seria enviado, em vez de falhar ou de fingir que enviou. Funciona com
 * qualquer provedor SMTP (Resend, SendGrid, Gmail com senha de app, etc.) —
 * ver o passo a passo em rotas.md.
 *
 * Nunca lança erro: uma falha de e-mail não deveria derrubar o fluxo de
 * inscrição/aprovação que a originou (a pessoa já está inscrita no banco de
 * dados; o e-mail é uma notificação, não a fonte da verdade).
 */
export async function enviarEmail({ para, assunto, texto }) {
  if (!smtpConfigurado) {
    console.log('\n[email] MODO SIMULAÇÃO — SMTP não configurado, e-mail não enviado de verdade.');
    console.log(`[email] Para: ${para}`);
    console.log(`[email] Assunto: ${assunto}`);
    console.log(`[email] Corpo:\n${texto}\n`);
    return { enviado: false, simulado: true };
  }

  try {
    await obterTransportador().sendMail({ from: env.emailRemetente, to: para, subject: assunto, text: texto });
    return { enviado: true, simulado: false };
  } catch (erro) {
    console.error(`[email] Falha ao enviar e-mail para ${para}:`, erro.message);
    return { enviado: false, simulado: false, erro: erro.message };
  }
}

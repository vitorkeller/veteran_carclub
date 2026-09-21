function obrigatoria(nome, valorPadraoDev) {
  const valor = process.env[nome] ?? valorPadraoDev;
  if (!valor) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${nome}`);
  }
  return valor;
}

export const env = {
  porta: process.env.PORT || 3001,
  databaseUrl: obrigatoria('DATABASE_URL'),
  // Em produção, JWT_SECRET deve vir do .env — nunca usar o padrão abaixo.
  jwtSecret: obrigatoria('JWT_SECRET', 'segredo-apenas-para-desenvolvimento-local'),
  jwtExpiracao: process.env.JWT_EXPIRACAO || '7d',

  // Supabase Storage (upload de arquivos — fotos e documentos). Sem
  // fallback para disco local: essas variáveis são obrigatórias.
  supabaseUrl: obrigatoria('SUPABASE_URL'),
  supabaseServiceRoleKey: obrigatoria('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || 'uploads',

  // SMTP para envio de e-mails (confirmação, aprovação/reprovação, código de
  // check-in). Sem essas variáveis, os e-mails só são registrados no console
  // (modo simulação) — ver services/email.js.
  smtpHost: process.env.SMTP_HOST || null,
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  smtpUser: process.env.SMTP_USER || null,
  smtpPass: process.env.SMTP_PASS || null,
  emailRemetente: process.env.EMAIL_FROM || 'Veteran Carclub <nao-responder@veterancarclub.com.br>',
};

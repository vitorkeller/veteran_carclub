import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Pasta onde os arquivos enviados (fotos, documentos) são gravados. */
export const PASTA_UPLOADS_LOCAL = path.join(process.cwd(), 'uploads');

fs.mkdirSync(PASTA_UPLOADS_LOCAL, { recursive: true });

function gerarNomeArquivo(nomeOriginal) {
  const sufixo = crypto.randomBytes(8).toString('hex');
  const extensao = path.extname(nomeOriginal).toLowerCase();
  return `${Date.now()}-${sufixo}${extensao}`;
}

/**
 * Salva um arquivo (buffer em memória, vindo do multer) em
 * `packages/backend/uploads/` e devolve o caminho relativo servido pelo
 * próprio Express (`/uploads/<arquivo>`).
 *
 * Sem armazenamento externo: os arquivos ficam só no disco local do
 * servidor, então não sobrevivem a um redeploy em plataformas com
 * filesystem efêmero — ok para o escopo atual do projeto.
 */
export function salvarArquivo(buffer, nomeOriginal) {
  const nomeArquivo = gerarNomeArquivo(nomeOriginal);
  fs.writeFileSync(path.join(PASTA_UPLOADS_LOCAL, nomeArquivo), buffer);
  return `/uploads/${nomeArquivo}`;
}

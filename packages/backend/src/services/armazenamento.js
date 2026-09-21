import crypto from 'node:crypto';
import path from 'node:path';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';

function gerarNomeArquivo(nomeOriginal) {
  const sufixo = crypto.randomBytes(8).toString('hex');
  const extensao = path.extname(nomeOriginal).toLowerCase();
  return `${Date.now()}-${sufixo}${extensao}`;
}

/**
 * Envia um arquivo (buffer em memória, vindo do multer) para o bucket
 * público do Supabase Storage e devolve a URL pública definitiva do
 * arquivo — pronta para ser gravada direto nas colunas `*_url` do banco e
 * usada como `src` de imagem no frontend, sem nenhum proxy do nosso
 * próprio backend.
 *
 * Sem fallback para disco local: o bucket é obrigatório (ver config/env.js)
 * — se as credenciais não estiverem configuradas, o servidor nem sobe.
 */
export async function salvarArquivo(buffer, nomeOriginal, mimetype) {
  const nomeArquivo = gerarNomeArquivo(nomeOriginal);

  const { error } = await supabase.storage
    .from(env.supabaseBucket)
    .upload(nomeArquivo, buffer, { contentType: mimetype, upsert: false });

  if (error) {
    throw new Error(`Falha ao enviar arquivo para o Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from(env.supabaseBucket).getPublicUrl(nomeArquivo);
  return data.publicUrl;
}

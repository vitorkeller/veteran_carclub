import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Client do Supabase usado só no backend, com a service role key — tem
 * acesso total ao projeto (ignora Row Level Security). Por isso nunca deve
 * ser exposta ao frontend nem usada em código que roda no navegador; quem
 * valida o que pode ser enviado (tipo de arquivo, tamanho) é o middleware
 * de upload (multer, em middlewares/upload.js), antes de o arquivo chegar
 * aqui.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

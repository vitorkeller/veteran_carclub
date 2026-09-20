import multer from 'multer';
import { ErroHttp } from '../utils/ErroHttp.js';

// Middleware de erro do Express (4 argumentos = assinatura especial, precisa manter `next`).
export function tratarErros(erro, req, res, next) { // eslint-disable-line no-unused-vars
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  // Erro de validação do zod: devolve a primeira mensagem, que já é amigável
  // (definida nos próprios esquemas de cada módulo).
  if (erro.name === 'ZodError') {
    return res.status(400).json({ erro: erro.issues[0]?.message ?? 'Dados inválidos' });
  }

  // Erros de upload (multer): arquivo grande demais, muitos arquivos, etc.
  // São erro do cliente (400), não falha do servidor.
  if (erro instanceof multer.MulterError) {
    const mensagens = {
      LIMIT_FILE_SIZE: 'Arquivo muito grande (limite de 5MB por arquivo)',
      LIMIT_FILE_COUNT: 'Muitos arquivos enviados de uma vez',
      LIMIT_UNEXPECTED_FILE: 'Campo de arquivo inesperado',
    };
    return res.status(400).json({ erro: mensagens[erro.code] ?? 'Erro no envio do arquivo' });
  }
  // O fileFilter do multer (tipo de arquivo não permitido) lança um Error comum.
  if (erro.message?.startsWith('Tipo de arquivo não permitido')) {
    return res.status(400).json({ erro: erro.message });
  }

  // Erros vindos direto do driver `pg` (constraints do banco) — mapeados para 409/400
  // em vez de vazar detalhe interno de SQL para o cliente.
  if (erro.code === '23505') return res.status(409).json({ erro: 'Registro duplicado' });
  if (erro.code === '23503') return res.status(400).json({ erro: 'Referência inválida' });
  if (erro.code === '23514') return res.status(400).json({ erro: 'Dado fora das regras permitidas' });

  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}

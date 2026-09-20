import { ErroHttp } from '../utils/ErroHttp.js';
import { verificarToken } from '../utils/token.js';

/**
 * Exige um Bearer token válido. Popula req.usuario = { id, tipo, status }.
 * Não consulta o banco a cada requisição (fica só no payload do token);
 * rotas que precisam de dados atualizados do usuário devem buscar explicitamente.
 */
export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [esquema, token] = cabecalho.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return next(new ErroHttp(401, 'Token de autenticação ausente'));
  }

  try {
    req.usuario = verificarToken(token);
    next();
  } catch {
    next(new ErroHttp(401, 'Token de autenticação inválido ou expirado'));
  }
}

/** Deve ser usado depois de `autenticar`. Restringe a rota a administradores. */
export function exigirAdmin(req, res, next) {
  if (req.usuario?.tipo !== 'admin') {
    return next(new ErroHttp(403, 'Acesso restrito a administradores'));
  }
  next();
}

/**
 * Deve ser usado depois de `autenticar`. Bloqueia usuários (visitante/expositor)
 * cujo cadastro ainda não foi aprovado por um admin.
 */
export function exigirAprovado(req, res, next) {
  if (req.usuario?.tipo !== 'admin' && req.usuario?.status !== 'aprovado') {
    return next(new ErroHttp(403, 'Cadastro ainda não aprovado pela organização'));
  }
  next();
}

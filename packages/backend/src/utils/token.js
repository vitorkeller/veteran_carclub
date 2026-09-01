import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/** Gera um JWT contendo o essencial para autorizar requisições futuras. */
export function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, tipo: usuario.tipo, status: usuario.status },
    env.jwtSecret,
    { expiresIn: env.jwtExpiracao }
  );
}

/** Lança se o token for inválido/expirado; devolve o payload se for válido. */
export function verificarToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

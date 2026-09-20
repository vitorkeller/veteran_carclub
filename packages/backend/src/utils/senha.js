import bcrypt from 'bcryptjs';

const CUSTO_HASH = 10;

export async function gerarHash(senhaEmTexto) {
  return bcrypt.hash(senhaEmTexto, CUSTO_HASH);
}

export async function conferir(senhaEmTexto, hash) {
  return bcrypt.compare(senhaEmTexto, hash);
}

// Uso: node --env-file=.env src/scripts/criar-admin.js "Nome" email@dominio.com "senha-forte"
//
// Por regra de negócio, administradores são "pré-cadastrados no banco de dados":
// não existe rota pública para criar um admin. Este script é o jeito oficial
// de dar o primeiro (e os próximos) acesso administrativo.
import { migrar, encerrar } from '../db.js';
import { gerarHash } from '../utils/senha.js';
import * as usuariosRepo from '../modules/usuarios/usuarios.repositorio.js';

const [, , nomeCompleto, email, senha] = process.argv;

if (!nomeCompleto || !email || !senha) {
  console.error('Uso: node --env-file=.env src/scripts/criar-admin.js "Nome" email@dominio.com "senha-forte"');
  process.exit(1);
}

await migrar();

const existente = await usuariosRepo.buscarPorEmail(email);
if (existente) {
  console.error(`Já existe um usuário com o e-mail ${email}`);
  await encerrar();
  process.exit(1);
}

const senhaHash = await gerarHash(senha);
const admin = await usuariosRepo.inserir({ nomeCompleto, email, senhaHash, tipo: 'admin' });
await usuariosRepo.atualizarStatus(admin.id, 'aprovado');

console.log(`Administrador criado: ${admin.email} (id ${admin.id})`);
await encerrar();

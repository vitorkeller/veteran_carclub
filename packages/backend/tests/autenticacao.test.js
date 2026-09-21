import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { limparBanco } from '../src/db.js';
import { gerarToken } from '../src/utils/token.js';
import { criarAdminDeTeste } from './ajuda.js';

const app = criarApp();

describe('autenticação', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('faz login com credenciais corretas e devolve um token sem a senha_hash', async () => {
    const { admin, senha } = await criarAdminDeTeste();

    const res = await request(app).post('/api/usuarios/login').send({ email: admin.email, senha });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.usuario.email).toBe(admin.email);
    expect(res.body.usuario).not.toHaveProperty('senha_hash');
  });

  it('rejeita senha errada com a mensagem genérica (não revela se o e-mail existe)', async () => {
    const { admin } = await criarAdminDeTeste();

    const res = await request(app).post('/api/usuarios/login').send({ email: admin.email, senha: 'senha-errada' });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe('E-mail ou senha inválidos');
  });

  it('rejeita e-mail inexistente com a mesma mensagem genérica', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({ email: 'ninguem@teste.com', senha: 'qualquer-coisa' });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe('E-mail ou senha inválidos');
  });

  it('bloqueia rota de admin sem token', async () => {
    const res = await request(app).get('/api/usuarios/pendentes');
    expect(res.status).toBe(401);
  });

  it('bloqueia rota de admin para um usuário autenticado que não é admin', async () => {
    // Visitante nunca loga de verdade (não tem senha) — geramos o token
    // manualmente pra testar a regra do exigirAdmin isolada do login.
    const tokenVisitante = gerarToken({ id: 999, tipo: 'visitante', status: 'aprovado' });

    const res = await request(app).get('/api/usuarios/pendentes').set('Authorization', `Bearer ${tokenVisitante}`);

    expect(res.status).toBe(403);
  });

  it('permite rota de admin com um token de admin válido', async () => {
    const { token } = await criarAdminDeTeste();

    const res = await request(app).get('/api/usuarios/pendentes').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

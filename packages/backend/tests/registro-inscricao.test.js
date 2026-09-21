import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';
import { limparBanco } from '../src/db.js';
import * as eventosRepo from '../src/modules/eventos/eventos.repositorio.js';
import { criarEventoDeTeste } from './ajuda.js';

const app = criarApp();

function payloadVisitante(sobrescritas = {}) {
  return {
    tipo: 'visitante',
    nomeCompleto: 'Fulano de Tal',
    email: `visitante-${Date.now()}-${Math.random().toString(36).slice(2)}@teste.com`,
    ...sobrescritas,
  };
}

describe('POST /api/usuarios/registrar', () => {
  beforeEach(async () => {
    await limparBanco();
  });

  it('cadastra um visitante e já aprova automaticamente', async () => {
    const evento = await criarEventoDeTeste();

    const res = await request(app).post('/api/usuarios/registrar').send(payloadVisitante({ eventoId: evento.id }));

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('aprovado');
    expect(res.body.tipo).toBe('visitante');
  });

  it('cadastra um expositor com o veículo, mas deixa pendente de aprovação', async () => {
    const evento = await criarEventoDeTeste();

    const res = await request(app)
      .post('/api/usuarios/registrar')
      .send({
        tipo: 'expositor',
        nomeCompleto: 'Fulana Exposição',
        email: `expositor-${Date.now()}@teste.com`,
        eventoId: evento.id,
        veiculo: {
          nome: 'Fusca Azul',
          modelo: 'Volkswagen Fusca',
          ano: 1978,
          documentoUrl: 'https://exemplo.com/documento.pdf',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pendente');
  });

  it('recusa e-mail duplicado com 409', async () => {
    const evento = await criarEventoDeTeste();
    const payload = payloadVisitante({ eventoId: evento.id });

    await request(app).post('/api/usuarios/registrar').send(payload);
    const res = await request(app).post('/api/usuarios/registrar').send(payload);

    expect(res.status).toBe(409);
  });

  it('recusa inscrição em evento inexistente com 404', async () => {
    const res = await request(app).post('/api/usuarios/registrar').send(payloadVisitante({ eventoId: 999999 }));
    expect(res.status).toBe(404);
  });

  it('recusa inscrição em evento cancelado com 400', async () => {
    const evento = await criarEventoDeTeste();
    await eventosRepo.atualizar(evento.id, { status: 'cancelado' });

    const res = await request(app).post('/api/usuarios/registrar').send(payloadVisitante({ eventoId: evento.id }));

    expect(res.status).toBe(400);
  });

  it('respeita a capacidade máxima do evento e recusa a inscrição excedente com 409', async () => {
    const evento = await criarEventoDeTeste({ capacidadeMaxima: 2 });

    const res1 = await request(app).post('/api/usuarios/registrar').send(payloadVisitante({ eventoId: evento.id }));
    const res2 = await request(app).post('/api/usuarios/registrar').send(payloadVisitante({ eventoId: evento.id }));
    const res3 = await request(app).post('/api/usuarios/registrar').send(payloadVisitante({ eventoId: evento.id }));

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res3.status).toBe(409);
    expect(res3.body.erro).toMatch(/capacidade máxima/);
  });

  it('valida o formato do e-mail antes de tocar no banco', async () => {
    const evento = await criarEventoDeTeste();

    const res = await request(app)
      .post('/api/usuarios/registrar')
      .send(payloadVisitante({ eventoId: evento.id, email: 'nao-e-um-email' }));

    expect(res.status).toBe(400);
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { migrar, limparBanco, encerrar } from '../../src/db.js';
import { criarEventoDeTeste } from '../ajuda.js';
import { dispararCarga, imprimirResumo } from './ajuda-carga.js';

// Contra um backend JÁ RODANDO (latência de rede e event loop reais).
const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';
const CONCORRENCIA = Number(process.env.CARGA_CONCORRENCIA ?? 20);
const P95_MAX_MS = Number(process.env.CARGA_P95_INSCRICAO_MS ?? 2000);

function registrarVisitante(eventoId) {
  return fetch(`${BASE_URL}/api/usuarios/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: 'visitante',
      nomeCompleto: 'Carga de Teste',
      email: `carga-${Date.now()}-${Math.random().toString(36).slice(2)}@teste.com`,
      eventoId,
    }),
  });
}

describe('carga: POST /api/usuarios/registrar sob concorrência', () => {
  beforeAll(async () => {
    await migrar();
    await limparBanco();
  });

  afterAll(async () => {
    await encerrar();
  });

  it(`${CONCORRENCIA} inscrições simultâneas nunca furam a capacidade do evento`, async () => {
    const capacidade = 5;
    const evento = await criarEventoDeTeste({ capacidadeMaxima: capacidade });

    // concorrencia === total: todas as requisições disparam ao mesmo tempo.
    const { resultados, resumo } = await dispararCarga({
      total: CONCORRENCIA,
      concorrencia: CONCORRENCIA,
      requisicao: async () => registrarVisitante(evento.id),
    });
    imprimirResumo('registrar (rajada)', resumo);

    const sucessos = resultados.filter((r) => r.status === 201).length;
    const lotados = resultados.filter((r) => r.status === 409).length;

    // Regra de negócio mais crítica: o FOR UPDATE precisa segurar o limite
    // mesmo com concorrência real (os testes de integração são sequenciais).
    expect(sucessos).toBe(capacidade);
    expect(lotados).toBe(CONCORRENCIA - capacidade);
    expect(resumo.p95).toBeLessThan(P95_MAX_MS);
  });
});

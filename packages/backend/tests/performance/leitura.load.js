import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { migrar, limparBanco, encerrar } from '../../src/db.js';
import { criarEventoDeTeste } from '../ajuda.js';
import { dispararCarga, imprimirResumo } from './ajuda-carga.js';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';
const TOTAL = Number(process.env.CARGA_TOTAL ?? 300);
const CONCORRENCIA = Number(process.env.CARGA_CONCORRENCIA_LEITURA ?? 25);
const P95_MAX_MS = Number(process.env.CARGA_P95_LEITURA_MS ?? 500);

describe('carga: rotas públicas de leitura', () => {
  let eventoId;

  beforeAll(async () => {
    await migrar();
    await limparBanco();
    const evento = await criarEventoDeTeste({ capacidadeMaxima: 100 });
    eventoId = evento.id;
  });

  afterAll(async () => {
    await encerrar();
  });

  const rotas = [
    { nome: 'GET /api/saude', caminho: () => '/api/saude' },
    { nome: 'GET /api/eventos', caminho: () => '/api/eventos' },
    { nome: 'GET /api/eventos/:id', caminho: () => `/api/eventos/${eventoId}` },
    { nome: 'GET /api/historias', caminho: () => '/api/historias' },
  ];

  for (const { nome, caminho } of rotas) {
    it(`${nome} sustenta ${TOTAL} requisições (conc. ${CONCORRENCIA}) sem erro e dentro do orçamento`, async () => {
      const { resultados, resumo } = await dispararCarga({
        total: TOTAL,
        concorrencia: CONCORRENCIA,
        requisicao: () => fetch(`${BASE_URL}${caminho()}`),
      });
      imprimirResumo(nome, resumo);

      const falhas = resultados.filter((r) => r.status !== 200).length;
      expect(falhas).toBe(0);
      expect(resumo.p95).toBeLessThan(P95_MAX_MS);
    });
  }
});

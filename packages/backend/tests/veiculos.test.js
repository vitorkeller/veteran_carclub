import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { criarApp } from '../src/app.js';

const app = criarApp();

describe('a API sobe', () => {
  it('responde na verificação de saúde', async () => {
    const res = await request(app).get('/api/saude');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

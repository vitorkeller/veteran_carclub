import { beforeAll, afterAll } from 'vitest';
import { migrar, encerrar } from '../src/db.js';

// Roda uma vez por arquivo de teste (Vitest isola cada arquivo em seu
// próprio processo — ver poolOptions padrão). migrar() é idempotente
// (CREATE TABLE IF NOT EXISTS), então rodar de novo em cada arquivo é seguro.
beforeAll(async () => {
  await migrar();
});

afterAll(async () => {
  await encerrar();
});

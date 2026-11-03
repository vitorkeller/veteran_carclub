import { bench, describe } from 'vitest';
import { gerarHash, conferir } from '../../src/utils/senha.js';
import { gerarCodigoCheckin } from '../../src/utils/codigoCheckin.js';
import { gerarToken } from '../../src/utils/token.js';

const hashFixo = await gerarHash('fixa-para-bench');

describe('utils/senha (bcrypt, CUSTO_HASH = 10)', () => {
  bench('gerarHash', async () => {
    await gerarHash('uma-senha-de-teste-123');
  });

  bench('conferir', async () => {
    await conferir('fixa-para-bench', hashFixo);
  });
});

describe('utils diversos', () => {
  bench('gerarCodigoCheckin', () => {
    gerarCodigoCheckin();
  });

  bench('gerarToken (JWT)', () => {
    gerarToken({ id: 1, tipo: 'admin', status: 'aprovado' });
  });
});

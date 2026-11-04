import { defineConfig } from 'vitest/config';

// Config dedicada aos testes de carga: roda só tests/performance/*.load.js,
// sem o setupFiles padrão (cada arquivo cuida de migrar/limparBanco/encerrar,
// porque depende de um servidor já rodando contra o MESMO banco).
export default defineConfig({
  test: {
    include: ['tests/performance/**/*.load.js'],
    testTimeout: 60000,
    // Os arquivos compartilham o banco e usam TRUNCATE: nunca em paralelo.
    fileParallelism: false,
  },
});

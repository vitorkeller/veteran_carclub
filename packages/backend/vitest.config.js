import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000, // integração com banco real é mais lenta que teste unitário puro
    // Os testes de integração compartilham um único banco de teste e usam
    // TRUNCATE entre casos — rodar arquivos de teste em paralelo faria um
    // arquivo apagar dados que outro ainda está usando no mesmo instante.
    fileParallelism: false,
  },
});

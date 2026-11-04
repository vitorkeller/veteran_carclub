/** Percentil (p entre 0 e 100) de uma lista de durações em ms. */
export function percentil(valoresMs, p) {
  const ordenado = [...valoresMs].sort((a, b) => a - b);
  const indice = Math.ceil((p / 100) * ordenado.length) - 1;
  return ordenado[Math.max(0, indice)];
}

/**
 * Dispara `total` requisições mantendo no máximo `concorrencia` em voo ao
 * mesmo tempo (pool de workers). `requisicao(i)` deve devolver { status }.
 * Devolve cada resultado com a duração em ms e o resumo da rodada.
 */
export async function dispararCarga({ total, concorrencia, requisicao }) {
  const resultados = [];
  let proximo = 0;

  async function trabalhador() {
    while (true) {
      const i = proximo++;
      if (i >= total) return;
      const inicio = performance.now();
      let status = 0;
      try {
        ({ status } = await requisicao(i));
      } catch {
        status = 0; // erro de rede conta como falha
      }
      resultados.push({ status, duracaoMs: performance.now() - inicio });
    }
  }

  const inicioTotal = performance.now();
  await Promise.all(Array.from({ length: Math.min(concorrencia, total) }, trabalhador));
  const duracaoTotalS = (performance.now() - inicioTotal) / 1000;

  const duracoes = resultados.map((r) => r.duracaoMs);
  return {
    resultados,
    resumo: {
      total,
      concorrencia,
      rps: total / duracaoTotalS,
      p50: percentil(duracoes, 50),
      p95: percentil(duracoes, 95),
      p99: percentil(duracoes, 99),
      max: Math.max(...duracoes),
    },
  };
}

export function imprimirResumo(titulo, r) {
  console.log(
    `[carga] ${titulo} — ${r.total} req (conc. ${r.concorrencia}) · ${r.rps.toFixed(0)} req/s` +
      ` · p50 ${r.p50.toFixed(0)}ms · p95 ${r.p95.toFixed(0)}ms · p99 ${r.p99.toFixed(0)}ms · máx ${r.max.toFixed(0)}ms`
  );
}

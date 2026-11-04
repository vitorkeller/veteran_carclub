import { test, expect, chromium } from "@playwright/test";

const SESSOES_SIMULTANEAS = Number(process.env.CARGA_SESSOES ?? 10);
const MAX_MS = Number(process.env.CARGA_SESSOES_MAX_MS ?? 8000);

test(`Home atende ${SESSOES_SIMULTANEAS} sessões simultâneas dentro do orçamento`, async ({
    baseURL,
}) => {
    const browser = await chromium.launch();

    try {
        const tempos = await Promise.all(
            Array.from({ length: SESSOES_SIMULTANEAS }, async () => {
                // Um context criado à mão não herda o baseURL do config.
                const contexto = await browser.newContext({ baseURL });
                const pagina = await contexto.newPage();
                const inicio = Date.now();
                await pagina.goto("/", { waitUntil: "networkidle" });
                const duracaoMs = Date.now() - inicio;
                await contexto.close();
                return duracaoMs;
            }),
        );

        const media = tempos.reduce((soma, t) => soma + t, 0) / tempos.length;
        console.log(
            `[carga] ${SESSOES_SIMULTANEAS} sessões — média ${media.toFixed(0)}ms · máx ${Math.max(...tempos)}ms`,
        );

        expect(Math.max(...tempos)).toBeLessThan(MAX_MS);
    } finally {
        await browser.close();
    }
});

import { test, expect, type Page } from "@playwright/test";

declare global {
    interface Window {
        __lcp: number;
        __cls: number;
    }
}

/** Métricas via Performance API nativa do navegador, sem lib externa. */
async function medirCarregamento(page: Page, caminho: string) {
    // O observer precisa existir ANTES da navegação, senão perde o LCP.
    await page.addInitScript(() => {
        window.__lcp = 0;
        window.__cls = 0;

        new PerformanceObserver((lista) => {
            const entradas = lista.getEntries();
            const ultima = entradas[entradas.length - 1];
            if (ultima) window.__lcp = ultima.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });

        new PerformanceObserver((lista) => {
            for (const entrada of lista.getEntries()) {
                const mudanca = entrada as PerformanceEntry & {
                    value: number;
                    hadRecentInput: boolean;
                };
                if (!mudanca.hadRecentInput) window.__cls += mudanca.value;
            }
        }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(caminho, { waitUntil: "networkidle" });

    return page.evaluate(() => {
        const [nav] = performance.getEntriesByType(
            "navigation",
        ) as PerformanceNavigationTiming[];
        const fcp = performance.getEntriesByName("first-contentful-paint")[0];
        return {
            ttfbMs: nav.responseStart - nav.requestStart,
            fcpMs: fcp ? fcp.startTime : 0,
            lcpMs: window.__lcp,
            cls: window.__cls,
            loadMs: nav.loadEventEnd - nav.startTime,
        };
    });
}

const paginasPublicas = [
    { nome: "Home", caminho: "/" },
    { nome: "Agenda", caminho: "/agenda" },
    { nome: "Acervo", caminho: "/acervo" },
    { nome: "Histórias", caminho: "/historias" },
];

// Orçamentos generosos de propósito (runner de CI é lento e instável):
// o objetivo é pegar regressão grosseira, não microotimizar.
const ORCAMENTO = { ttfbMs: 1000, fcpMs: 3000, lcpMs: 4000, cls: 0.25 };

for (const { nome, caminho } of paginasPublicas) {
    test(`${nome} carrega dentro do orçamento de performance`, async ({
        page,
    }) => {
        const m = await medirCarregamento(page, caminho);

        console.log(
            `[perf] ${nome} — TTFB ${m.ttfbMs.toFixed(0)}ms · FCP ${m.fcpMs.toFixed(0)}ms · ` +
                `LCP ${m.lcpMs.toFixed(0)}ms · CLS ${m.cls.toFixed(3)} · load ${m.loadMs.toFixed(0)}ms`,
        );

        expect(m.ttfbMs).toBeLessThan(ORCAMENTO.ttfbMs);
        expect(m.fcpMs).toBeLessThan(ORCAMENTO.fcpMs);
        expect(m.lcpMs).toBeLessThan(ORCAMENTO.lcpMs);
        expect(m.cls).toBeLessThan(ORCAMENTO.cls);
    });
}

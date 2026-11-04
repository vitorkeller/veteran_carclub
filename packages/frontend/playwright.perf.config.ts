import { defineConfig, devices } from "@playwright/test";

// Config separada da dos testes e2e funcionais: os de performance são mais
// lentos e sensíveis ao ambiente, então não entram no `npm run test:e2e`.
export default defineConfig({
    testDir: "./e2e/performance",
    timeout: 60_000,
    fullyParallel: false,
    workers: 1, // um teste por vez: medições em paralelo se atrapalham
    reporter: [["list"]],
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

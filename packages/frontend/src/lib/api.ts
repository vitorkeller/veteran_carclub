import type {
    AgendaEventos,
    Evento,
    Historia,
    PublicacaoInstagram,
    VeiculoAcervo,
} from "@/types";

const API_URL_PUBLICA =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * URL base da API.
 *
 * No navegador (e em produção na Vercel) vale `NEXT_PUBLIC_API_URL`. Dentro do
 * Docker, porém, o código que roda no SERVIDOR do Next.js (Server Components)
 * precisa chamar o backend pelo nome do serviço na rede interna — lá,
 * `localhost` seria o próprio container do frontend. Por isso, no servidor,
 * `API_URL_INTERNA` (quando definida) tem prioridade. Sem ela, o comportamento
 * é exatamente o de antes.
 */
export const API_URL =
    typeof window === "undefined"
        ? (process.env.API_URL_INTERNA ?? API_URL_PUBLICA)
        : API_URL_PUBLICA;

/**
 * `cache: "no-store"` em todas as buscas públicas: o site é de baixo tráfego
 * (um clube de carros, não um produto de escala), então preferimos sempre
 * bater no backend a arriscar mostrar uma agenda/acervo desatualizados depois
 * que o admin acabou de cadastrar algo. Sem isso, o Next.js cacheava a
 * resposta do fetch e as mudanças do admin demoravam a aparecer no site.
 */
const SEM_CACHE: RequestInit = { cache: "no-store" };

/** Próximos eventos para a Home (até 3). Vazio se não houver nenhum cadastrado. */
export async function buscarEventosDestaque(): Promise<Evento[]> {
    const resposta = await fetch(
        `${API_URL}/api/eventos?destaque=1`,
        SEM_CACHE,
    );
    if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`);
    return resposta.json();
}

/** Agenda completa (página /agenda): próximos e passados. */
export async function buscarAgenda(): Promise<AgendaEventos> {
    const resposta = await fetch(`${API_URL}/api/eventos`, SEM_CACHE);
    if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`);
    return resposta.json();
}

/** Detalhe de um evento (página /agenda/[id]): inclui galeria e participantes se já passou. */
export async function buscarEventoPorId(
    id: number | string,
): Promise<Evento | null> {
    const resposta = await fetch(`${API_URL}/api/eventos/${id}`, SEM_CACHE);
    if (resposta.status === 404) return null;
    if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`);
    return resposta.json();
}

/** Catálogo público de veículos (página /acervo) -- só os aprovados na curadoria do admin. */
export async function buscarAcervo(): Promise<VeiculoAcervo[]> {
    const resposta = await fetch(`${API_URL}/api/veiculos`, SEM_CACHE);
    if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`);
    return resposta.json();
}

/** Todas as histórias (página /historias) -- cada uma é o resumo de um evento passado. */
export async function buscarHistorias(): Promise<Historia[]> {
    const resposta = await fetch(`${API_URL}/api/historias`, SEM_CACHE);
    if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`);
    return resposta.json();
}

/** Histórias em destaque (Home). */
export async function buscarHistoriasDestaque(): Promise<Historia[]> {
    const resposta = await fetch(
        `${API_URL}/api/historias?destaque=1`,
        SEM_CACHE,
    );
    if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`);
    return resposta.json();
}

export async function buscarInstagram(): Promise<{
    publicacoes: PublicacaoInstagram[];
    demonstracao: boolean;
} | null> {
    try {
        const resposta = await fetch(`${API_URL}/api/instagram`, SEM_CACHE);
        if (!resposta.ok) return null;
        return resposta.json();
    } catch {
        return null;
    }
}

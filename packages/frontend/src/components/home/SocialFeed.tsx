import type { PublicacaoInstagram } from "@/types";

function PlaceholderTile() {
  return (
    <div className="flex aspect-square items-center justify-center rounded-lg bg-gelo">
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 text-azul-claro"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

type SocialFeedProps = {
  /** null = a busca falhou por completo (rede indisponível); mostramos os tiles-placeholder. */
  dados: { publicacoes: PublicacaoInstagram[]; demonstracao: boolean } | null;
};

/**
 * `demonstracao: true` quando o clube ainda não configurou a Instagram Graph
 * API -- os posts vêm de `PUBLICACOES_DEMONSTRACAO` no backend (claramente
 * fictícios), e mostramos um selo "prévia" para não passar por conteúdo real.
 */
export function SocialFeed({ dados }: SocialFeedProps) {
  const publicacoes = dados?.publicacoes ?? [];

  return (
    <section className="bg-branco px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
            @veterancarjoinville
          </p>
          <h2 className="font-display text-3xl font-semibold text-azul-marinho">
            Bastidores no Instagram
          </h2>
          {dados?.demonstracao && (
            <p className="mx-auto mt-2 max-w-md text-sm text-texto/70">
              Prévia com fotos dos eventos.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {publicacoes.length > 0
            ? publicacoes.slice(0, 4).map((post) => (
                <a
                  key={post.id}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-square overflow-hidden rounded-lg bg-gelo"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- vem da CDN do Instagram (ou de um serviço de placeholder em modo demonstração), fora dos domínios configuráveis do next/image */}
                  <img src={post.imagemUrl} alt={post.legenda || "Publicação do Instagram"} className="h-full w-full object-cover" />
                  {dados?.demonstracao && (
                    <span className="absolute left-2 top-2 rounded-full bg-azul-marinho/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-branco">
                      Prévia
                    </span>
                  )}
                </a>
              ))
            : Array.from({ length: 4 }).map((_, indice) => <PlaceholderTile key={indice} />)}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://www.instagram.com/veterancarjoinville/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-azul-aco hover:text-azul-marinho"
          >
            Seguir no Instagram →
          </a>
        </div>
      </div>
    </section>
  );
}

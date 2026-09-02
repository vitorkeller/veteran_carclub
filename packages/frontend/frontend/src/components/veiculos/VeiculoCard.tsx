import type { VeiculoAcervo } from "@/types";

/** Placeholder visual quando o veículo ainda não tem foto cadastrada. */
function SemFoto() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-gelo">
      <svg
        viewBox="0 0 64 40"
        className="h-10 w-16 text-azul-claro"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 28 C6 22 10 18 16 17 L20 16 C24 8 32 4 40 4 L46 4 C52 4 57 8 60 14 L60 20" />
        <path d="M6 28 L60 28" />
        <circle cx="18" cy="29" r="5" />
        <circle cx="48" cy="29" r="5" />
      </svg>
    </div>
  );
}

/** Card clicável do Acervo -- abrir o modal com detalhes é responsabilidade de quem usa este componente. */
export function VeiculoCard({ veiculo, aoClicar }: { veiculo: VeiculoAcervo; aoClicar: () => void }) {
  const capa = veiculo.imagens[0];

  return (
    <button
      type="button"
      onClick={aoClicar}
      className="flex flex-col overflow-hidden rounded-lg border border-cromo bg-branco text-left transition-shadow hover:shadow-md"
    >
      <div className={capa ? "" : "p-4 pb-0"}>
        {capa ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem enviada via upload local, fora dos domínios configuráveis do next/image
          <img src={capa} alt={veiculo.nome} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <SemFoto />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="font-display text-xl font-semibold text-azul-marinho">
            {veiculo.nome}
          </h3>
          <p className="font-mono text-sm text-azul-aco">
            {veiculo.modelo} · {veiculo.ano}
          </p>
        </div>

        <p className="text-sm font-medium text-texto">{veiculo.proprietario_nome}</p>

        {veiculo.eventos.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {veiculo.eventos.map((nomeEvento) => (
              <span
                key={nomeEvento}
                className="rounded-full bg-gelo px-3 py-1 text-xs font-medium text-azul-aco"
              >
                {nomeEvento}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

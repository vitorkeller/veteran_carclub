import { Carousel } from "@/components/ui/Carousel";
import type { VeiculoAcervo } from "@/types";

export function VeiculoModal({ veiculo }: { veiculo: VeiculoAcervo }) {
  return (
    <div>
      <Carousel imagens={veiculo.imagens} alt={veiculo.nome} />

      <div className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-azul-marinho">{veiculo.nome}</h2>
          <p className="font-mono text-sm text-azul-aco">
            {veiculo.modelo} · {veiculo.ano}
          </p>
        </div>

        <div className="text-sm text-texto">
          <p className="font-medium text-azul-marinho">Dono: {veiculo.proprietario_nome}</p>
          {veiculo.proprietario_instagram && (
            <a
              href={`https://instagram.com/${veiculo.proprietario_instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-azul-aco hover:text-azul-marinho"
            >
              {veiculo.proprietario_instagram}
            </a>
          )}
        </div>

        {veiculo.modificacoes && (
          <div>
            <p className="text-sm font-semibold text-azul-marinho">Descrição / Modificações</p>
            <p className="mt-1 text-sm text-texto">{veiculo.modificacoes}</p>
          </div>
        )}

        {veiculo.eventos.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
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
    </div>
  );
}

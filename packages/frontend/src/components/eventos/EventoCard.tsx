import Link from "next/link";
import { Placa } from "@/components/ui/Placa";
import { formatarDataCurta, formatarDataLonga, formatarJanelaHorario } from "@/lib/formatadores";
import type { Evento } from "@/types";

type EventoCardProps = {
  evento: Evento;
  /** 'proximo' mostra CTA de inscrição; 'passado' mostra selo de realizado e vira link para o detalhe. */
  variante?: "proximo" | "passado";
};

/** Placeholder visual quando o evento ainda não tem imagem de capa cadastrada. */
function SemCapa() {
  return (
    <div className="flex aspect-[16/9] items-center justify-center bg-gelo">
      <svg
        viewBox="0 0 64 40"
        className="h-9 w-14 text-azul-claro"
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

function Conteudo({ evento, variante }: EventoCardProps) {
  const janela = formatarJanelaHorario(evento.horario_inicio, evento.horario_termino);

  return (
    <>
      {evento.imagem_capa_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- imagem enviada via upload local, fora dos domínios configuráveis do next/image
        <img src={evento.imagem_capa_url} alt={evento.nome} className="aspect-[16/9] w-full object-cover" />
      ) : (
        <SemCapa />
      )}

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <Placa rotulo={evento.cidade} valor={formatarDataCurta(evento.data_evento)} />
          {variante === "passado" && (
            <span className="rounded-full bg-gelo px-3 py-1 text-xs font-semibold uppercase tracking-wide text-azul-aco">
              Realizado
            </span>
          )}
        </div>

        <div>
          <h3 className="font-display text-xl font-semibold text-azul-marinho">{evento.nome}</h3>
          <p className="mt-1 text-sm text-texto/80">
            {formatarDataLonga(evento.data_evento)}
            {janela && ` · ${janela}`}
          </p>
          {evento.local && <p className="text-sm text-texto/80">{evento.local}</p>}
        </div>

        {evento.descricao && <p className="line-clamp-3 text-sm text-texto">{evento.descricao}</p>}

        {variante === "proximo" && (
          <Link
            href={`/inscricao?evento=${evento.id}`}
            className="mt-auto text-sm font-semibold text-azul-aco hover:text-azul-marinho"
          >
            Inscreva-se →
          </Link>
        )}
        {variante === "passado" && (
          <span className="mt-auto text-sm font-semibold text-azul-aco">Ver detalhes do encontro →</span>
        )}
      </div>
    </>
  );
}

export function EventoCard({ evento, variante = "proximo" }: EventoCardProps) {
  const classes =
    "flex flex-1 flex-col overflow-hidden rounded-lg border border-cromo bg-branco transition-shadow hover:shadow-md";

  if (variante === "passado") {
    return (
      <Link href={`/agenda/${evento.id}`} className={classes}>
        <Conteudo evento={evento} variante={variante} />
      </Link>
    );
  }

  return (
    <article className={classes}>
      <Conteudo evento={evento} variante={variante} />
    </article>
  );
}

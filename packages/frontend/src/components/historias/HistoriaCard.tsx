import Link from "next/link";
import { Placa } from "@/components/ui/Placa";
import { formatarDataCurta } from "@/lib/formatadores";
import type { Historia } from "@/types";

export function HistoriaCard({ historia }: { historia: Historia }) {
  const conteudo = (
    <article className="flex flex-col overflow-hidden rounded-lg border border-cromo bg-branco transition-shadow hover:shadow-md sm:flex-row">
      <div className="relative shrink-0 sm:w-56">
        {historia.evento_imagem_capa_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem enviada via upload local, fora dos domínios configuráveis do next/image
          <img
            src={historia.evento_imagem_capa_url}
            alt={historia.evento_nome ?? historia.titulo}
            className="aspect-video h-full w-full object-cover sm:aspect-auto"
          />
        ) : (
          <div className="flex aspect-video h-full w-full items-center justify-center bg-gelo sm:aspect-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-azul-claro bg-branco font-display text-xl font-semibold text-azul-aco">
              VC
            </div>
          </div>
        )}
        {historia.evento_data && (
          <div className="absolute bottom-3 left-3">
            <Placa rotulo={historia.evento_local ?? "Joinville"} valor={formatarDataCurta(historia.evento_data)} />
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-azul-marinho">
          {historia.titulo}
        </h3>
        {historia.evento_nome && (
          <p className="mt-0.5 text-sm font-medium text-azul-aco">{historia.evento_nome}</p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-texto">{historia.conteudo}</p>
      </div>
    </article>
  );

  if (!historia.evento_id) return conteudo;

  return <Link href={`/agenda/${historia.evento_id}`}>{conteudo}</Link>;
}

import Link from "next/link";
import { Placa } from "@/components/ui/Placa";
import { formatarDataCurta } from "@/lib/formatadores";
import type { Historia } from "@/types";

export function FeaturedStories({ historias }: { historias: Historia[] }) {
  const historia = historias[0];
  if (!historia) return null;

  const conteudo = (
    <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[220px_1fr] md:items-center">
      <div className="flex justify-center">
        {historia.evento_data ? (
          <Placa rotulo={historia.evento_nome ?? "Encontro"} valor={formatarDataCurta(historia.evento_data)} />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-azul-claro bg-branco font-display text-2xl font-semibold text-azul-aco">
            VC
          </div>
        )}
      </div>

      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
          Histórias em destaque
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-azul-marinho">
          {historia.titulo}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-texto">{historia.conteudo}</p>
        {historia.evento_id && (
          <span className="mt-4 inline-block text-sm font-semibold text-azul-aco">
            Ver o encontro completo →
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section id="historias" className="bg-gelo px-6 py-20">
      {historia.evento_id ? (
        <Link href={`/agenda/${historia.evento_id}`} className="block">
          {conteudo}
        </Link>
      ) : (
        conteudo
      )}
    </section>
  );
}

import Link from "next/link";
import { Placa } from "@/components/ui/Placa";
import { formatarDataCurta } from "@/lib/formatadores";
import type { Evento } from "@/types";

/** Silhueta de um clássico em linha única -- evita depender de foto de banco de imagens. */
function IlustracaoCarroClassico() {
  return (
    <svg
      viewBox="0 0 480 180"
      className="w-full max-w-2xl text-azul-claro"
      fill="none"
      role="img"
      aria-label="Ilustração de um carro clássico"
    >
      <path
        d="M40 130 C40 108 62 92 88 90 L120 88 C138 60 172 42 208 42 L268 42 C300 42 328 58 344 82 L388 90 C412 92 432 108 434 128"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 130 L434 128"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M150 88 L180 52 C190 46 200 44 212 44 L212 88 Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M222 44 L266 44 C284 44 300 54 314 72 L322 88 L222 88 Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="128" cy="132" r="26" stroke="currentColor" strokeWidth="4" />
      <circle cx="128" cy="132" r="9" stroke="currentColor" strokeWidth="3" />
      <circle cx="356" cy="132" r="26" stroke="currentColor" strokeWidth="4" />
      <circle cx="356" cy="132" r="9" stroke="currentColor" strokeWidth="3" />
      <circle cx="80" cy="94" r="4" fill="currentColor" />
      <circle cx="404" cy="96" r="4" fill="currentColor" />
    </svg>
  );
}

export function Hero({ proximoEvento }: { proximoEvento?: Evento }) {
  return (
    <section id="hero" className="relative overflow-hidden bg-azul-marinho">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-20 text-center md:py-28">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-claro">
          Joinville · SC
        </p>

        <h1 className="font-display text-4xl font-semibold uppercase tracking-tight text-branco sm:text-5xl md:text-6xl">
          Veteran Carclub
        </h1>

        <p className="max-w-xl text-balance text-lg text-azul-claro/90">
          Onde motores antigos ainda contam histórias. Encontros, exposições e
          o registro de cada carro e dono que já passou pelo clube.
        </p>

        <Link
          href="/agenda"
          className="rounded-md bg-azul-aco px-6 py-3 text-sm font-semibold text-branco transition-colors hover:bg-azul-claro hover:text-azul-marinho"
        >
          Ver próximos encontros
        </Link>

        <IlustracaoCarroClassico />
      </div>

      {proximoEvento && (
        <div className="absolute bottom-6 right-6 hidden sm:block">
          <Placa rotulo="Próximo encontro" valor={formatarDataCurta(proximoEvento.data_evento)} />
        </div>
      )}
    </section>
  );
}

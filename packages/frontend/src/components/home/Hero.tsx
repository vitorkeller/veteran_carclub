import Image from "next/image";
import Link from "next/link";
import { Placa } from "@/components/ui/Placa";
import { formatarDataCurta } from "@/lib/formatadores";
import type { Evento } from "@/types";

export function Hero({ proximoEvento }: { proximoEvento?: Evento }) {
    return (
        <section
            id="hero"
            className="relative overflow-visible bg-azul-marinho"
        >
            {/* FOTO DE FUNDO */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('/foto_clube.png')",
                }}
            />

            {/* CAMADA ESCURA SOBRE A FOTO */}
            <div className="absolute inset-0 bg-azul-marinho/45" />

            {/* CONTEÚDO DO HERO */}
            <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pt-10 pb-72 text-center md:pt-14 md:pb-80">

                <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-claro">
                    Joinville · SC
                </p>

                <h1 className="font-display text-4xl font-semibold uppercase tracking-tight text-branco sm:text-5xl md:text-6xl">
                    Veteran Carclub
                </h1>

                <p className="max-w-xl text-balance text-lg text-azul-claro/90">
                    Onde motores antigos ainda contam histórias. Encontros,
                    exposições e o registro de cada carro e dono que já passou
                    pelo clube.
                </p>

                <Link
                    href="/agenda"
                    className="rounded-md bg-azul-aco px-6 py-3 text-sm font-semibold text-branco transition-colors hover:bg-azul-claro hover:text-azul-marinho"
                >
                    Ver próximos encontros
                </Link>
            </div>

            {/* CARRO AZUL */}
            <Image
                src="/image_header.png"
                alt="Ilustração de um carro clássico"
                width={1536}
                height={750}
                className="absolute left-1/2 bottom-[-150px] z-20 h-auto w-[55vw] max-w-5xl -translate-x-1/2"
                priority
            />

            {/* PRÓXIMO EVENTO */}
            {proximoEvento && (
                <div className="absolute bottom-6 right-6 z-30 hidden sm:block">
                    <Placa
                        rotulo="Próximo encontro"
                        valor={formatarDataCurta(proximoEvento.data_evento)}
                    />
                </div>
            )}
        </section>
    );
}
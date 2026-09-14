import Image from "next/image";
import Link from "next/link";
import { Placa } from "@/components/ui/Placa";
import { formatarDataCurta } from "@/lib/formatadores";
import type { Evento } from "@/types";

export function Hero({ proximoEvento }: { proximoEvento?: Evento }) {
    return (
        <section id="hero" className="relative overflow-hidden bg-azul-marinho">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pt-6 pb-20 text-center md:pt-8 md:pb-28">
                <Image
                    src="/image_header.png"
                    alt="Ilustração de um carro clássico"
                    width={1536}
                    height={750}
                    className="h-auto w-[80vw] -mt-30"
                    priority
                />

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

            {proximoEvento && (
                <div className="absolute bottom-6 right-6 hidden sm:block">
                    <Placa
                        rotulo="Próximo encontro"
                        valor={formatarDataCurta(proximoEvento.data_evento)}
                    />
                </div>
            )}
        </section>
    );
}

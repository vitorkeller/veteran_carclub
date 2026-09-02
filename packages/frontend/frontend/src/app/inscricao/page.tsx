import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InscricaoForm } from "@/components/inscricao/InscricaoForm";
import { buscarEventoPorId } from "@/lib/api";

export const metadata = {
  title: "Inscrição | Veteran Carclub",
};

export default async function InscricaoPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string }>;
}) {
  const { evento: eventoIdParam } = await searchParams;
  const eventoId = eventoIdParam ? Number(eventoIdParam) : null;
  const evento = eventoId ? await buscarEventoPorId(eventoId).catch(() => null) : null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gelo">
        <section className="px-6 py-16">
          <div className="mx-auto max-w-2xl">
            {!eventoId || !evento ? (
              <div className="rounded-lg border border-cromo bg-branco p-8 text-center">
                <p className="font-display text-2xl font-semibold text-azul-marinho">
                  Escolha um encontro para se inscrever
                </p>
                <p className="mx-auto mt-3 max-w-md text-texto">
                  A inscrição sempre acontece a partir de um evento específico.
                  Veja os próximos encontros na Agenda e clique em
                  &quot;Inscreva-se&quot; no evento desejado.
                </p>
                <Link
                  href="/agenda"
                  className="mt-6 inline-block rounded-md bg-azul-aco px-6 py-3 text-sm font-semibold text-branco transition-colors hover:bg-azul-marinho"
                >
                  Ver agenda de eventos
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
                    Inscrição
                  </p>
                  <h1 className="mt-2 font-display text-4xl font-semibold text-azul-marinho">
                    Faça parte do clube
                  </h1>
                  <p className="mx-auto mt-4 max-w-md text-texto">
                    Visitante ou dono de um carro antigo — o cadastro já
                    confirma sua vaga no evento escolhido.
                  </p>
                </div>

                <InscricaoForm eventoId={evento.id} eventoNome={evento.nome} />
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

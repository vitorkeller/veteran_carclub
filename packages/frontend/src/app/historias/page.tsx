import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HistoriaCard } from "@/components/historias/HistoriaCard";
import { buscarHistorias } from "@/lib/api";

export const metadata = {
  title: "Histórias | Veteran Carclub",
};

export default async function HistoriasPage() {
  let historias: Awaited<ReturnType<typeof buscarHistorias>> = [];
  let erro = false;

  try {
    historias = await buscarHistorias();
  } catch {
    erro = true;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-branco">
        <section className="border-b border-cromo/60 bg-gelo px-6 py-16 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
            Histórias
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-azul-marinho">
            Histórias do clube
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-texto">
            Um recorte de cada encontro que já marcou o clube. Clique em uma
            história para ver os detalhes completos daquela edição.
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {erro ? (
              <p className="rounded-lg border border-cromo bg-gelo p-8 text-center text-texto">
                Não foi possível carregar as histórias agora. Tente novamente em instantes.
              </p>
            ) : historias.length === 0 ? (
              <p className="rounded-lg border border-cromo bg-gelo p-8 text-center text-texto">
                Nenhuma história publicada ainda.
              </p>
            ) : (
              historias.map((historia) => (
                <HistoriaCard key={historia.id} historia={historia} />
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

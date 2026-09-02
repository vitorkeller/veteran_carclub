import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AcervoGaleria } from "@/components/veiculos/AcervoGaleria";
import { buscarAcervo } from "@/lib/api";

export const metadata = {
  title: "Acervo | Veteran Carclub",
};

export default async function AcervoPage() {
  let veiculos: Awaited<ReturnType<typeof buscarAcervo>> = [];
  let erro = false;

  try {
    veiculos = await buscarAcervo();
  } catch {
    erro = true;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-branco">
        <section className="border-b border-cromo/60 bg-gelo px-6 py-16 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
            Acervo
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-azul-marinho">
            Carros que já passaram pelo clube
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-texto">
            O registro histórico de cada veículo e dono que já esteve em um
            encontro do Veteran Carclub. Clique em um carro para ver a ficha completa.
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            {erro ? (
              <p className="rounded-lg border border-cromo bg-gelo p-8 text-center text-texto">
                Não foi possível carregar o acervo agora. Tente novamente em instantes.
              </p>
            ) : veiculos.length === 0 ? (
              <p className="rounded-lg border border-cromo bg-gelo p-8 text-center text-texto">
                Nenhum veículo cadastrado no acervo ainda.
              </p>
            ) : (
              <AcervoGaleria veiculos={veiculos} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

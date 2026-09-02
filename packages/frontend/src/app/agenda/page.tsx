import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventoCard } from "@/components/eventos/EventoCard";
import { buscarAgenda } from "@/lib/api";

export const metadata = {
  title: "Agenda de Eventos | Veteran Carclub",
};

export default async function AgendaPage() {
  let proximos: Awaited<ReturnType<typeof buscarAgenda>>["proximos"] = [];
  let passados: Awaited<ReturnType<typeof buscarAgenda>>["passados"] = [];
  let erro = false;

  try {
    ({ proximos, passados } = await buscarAgenda());
  } catch {
    erro = true;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-branco">
        <section className="border-b border-cromo/60 bg-gelo px-6 py-16 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
            Agenda
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-azul-marinho">
            Agenda de Eventos
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-texto">
            Sempre em Joinville, sempre um encontro por dia. Confira o que vem
            por aí e reviva os encontros que já rolaram.
          </p>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 font-display text-2xl font-semibold text-azul-marinho">
              Próximos encontros
            </h2>
            {erro ? (
              <p className="rounded-lg border border-cromo bg-gelo p-8 text-center text-texto">
                Não foi possível carregar a agenda agora. Tente novamente em instantes.
              </p>
            ) : proximos.length === 0 ? (
              <p className="rounded-lg border border-cromo bg-gelo p-8 text-center text-texto">
                Nenhum evento agendado no momento. Volte em breve.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {proximos.map((evento) => (
                  <EventoCard key={evento.id} evento={evento} variante="proximo" />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-gelo px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 font-display text-2xl font-semibold text-azul-marinho">
              Histórico de encontros
            </h2>
            {erro ? null : passados.length === 0 ? (
              <p className="rounded-lg border border-cromo bg-branco p-8 text-center text-texto">
                Ainda não há encontros passados registrados.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {passados.map((evento) => (
                  <EventoCard key={evento.id} evento={evento} variante="passado" />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

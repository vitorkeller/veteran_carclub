import Link from "next/link";
import { EventoCard } from "@/components/eventos/EventoCard";
import type { Evento } from "@/types";

export function EventsSection({ eventos }: { eventos: Evento[] }) {
  return (
    <section id="eventos" className="bg-gelo px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
              Agenda
            </p>
            <h2 className="font-display text-3xl font-semibold text-azul-marinho">
              Eventos em destaque
            </h2>
          </div>
          <Link
            href="/agenda"
            className="text-sm font-semibold text-azul-aco hover:text-azul-marinho"
          >
            Ver agenda completa →
          </Link>
        </div>

        {eventos.length === 0 ? (
          <p className="rounded-lg border border-cromo bg-branco p-8 text-center text-texto">
            Nenhum evento agendado no momento. Volte em breve.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} variante="proximo" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

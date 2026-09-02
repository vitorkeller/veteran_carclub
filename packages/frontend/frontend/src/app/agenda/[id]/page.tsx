import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Carousel } from "@/components/ui/Carousel";
import { Placa } from "@/components/ui/Placa";
import { formatarDataLonga, formatarJanelaHorario } from "@/lib/formatadores";
import { buscarEventoPorId } from "@/lib/api";

export default async function EventoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await buscarEventoPorId(id).catch(() => null);

  if (!evento) notFound();

  const janela = formatarJanelaHorario(evento.horario_inicio, evento.horario_termino);
  const jaAconteceu = evento.status !== "cancelado" && evento.galeria !== undefined;
  const podeInscrever = !jaAconteceu && evento.status === "agendado";

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-branco">
        {evento.imagem_capa_url && (
          // eslint-disable-next-line @next/next/no-img-element -- imagem enviada via upload local, fora dos domínios configuráveis do next/image
          <img
            src={evento.imagem_capa_url}
            alt={evento.nome}
            className="aspect-[21/9] w-full object-cover"
          />
        )}

        <section className="border-b border-cromo/60 bg-gelo px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
                  {jaAconteceu ? "Encontro realizado" : "Próximo encontro"}
                </p>
                <h1 className="mt-2 font-display text-4xl font-semibold text-azul-marinho">
                  {evento.nome}
                </h1>
                <p className="mt-2 text-texto">
                  {formatarDataLonga(evento.data_evento)}
                  {janela && ` · ${janela}`}
                </p>
                {evento.local && <p className="text-texto">{evento.local}, {evento.cidade}</p>}
              </div>
              <Placa rotulo={evento.cidade} valor={evento.data_evento.slice(8, 10)} />
            </div>

            {evento.descricao && <p className="mt-6 max-w-2xl text-texto">{evento.descricao}</p>}

            {jaAconteceu && (
              <p className="mt-6 inline-block rounded-md bg-branco px-4 py-2 text-sm text-texto">
                <span className="font-semibold text-azul-marinho">{evento.presentes ?? 0}</span>{" "}
                pessoas compareceram a este encontro
              </p>
            )}

            {podeInscrever && (
              <Link
                href={`/inscricao?evento=${evento.id}`}
                className="mt-6 inline-block rounded-md bg-azul-aco px-6 py-3 text-sm font-semibold text-branco transition-colors hover:bg-azul-marinho"
              >
                Inscreva-se neste encontro →
              </Link>
            )}
          </div>
        </section>

        {jaAconteceu && evento.historia && (
          <section className="px-6 py-16">
            <div className="mx-auto max-w-4xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
                Histórias
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-azul-marinho">
                {evento.historia.titulo}
              </h2>
              <p className="mt-4 leading-relaxed text-texto">{evento.historia.conteudo}</p>
            </div>
          </section>
        )}

        {jaAconteceu && evento.galeria && evento.galeria.length > 0 && (
          <section className="bg-gelo px-6 py-16">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 font-display text-2xl font-semibold text-azul-marinho">
                Galeria
              </h2>
              <div className="overflow-hidden rounded-lg border border-cromo">
                <Carousel imagens={evento.galeria.map((img) => img.imagem_url)} alt={evento.nome} />
              </div>
            </div>
          </section>
        )}

        {jaAconteceu && evento.veiculos_destaque && evento.veiculos_destaque.length > 0 && (
          <section className="px-6 py-16">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 font-display text-2xl font-semibold text-azul-marinho">
                Carros em destaque
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {evento.veiculos_destaque.map((veiculo) => (
                  <article key={veiculo.id} className="overflow-hidden rounded-lg border border-cromo bg-branco">
                    {veiculo.imagens[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={veiculo.imagens[0]} alt={veiculo.nome} className="aspect-[4/3] w-full object-cover" />
                    )}
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-azul-marinho">{veiculo.nome}</h3>
                      <p className="font-mono text-sm text-azul-aco">{veiculo.modelo} · {veiculo.ano}</p>
                      <p className="mt-1 text-sm text-texto">{veiculo.proprietario_nome}</p>
                      {veiculo.modificacoes && <p className="mt-2 text-sm text-texto/90">{veiculo.modificacoes}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {jaAconteceu && (
          <section className="bg-gelo px-6 py-16">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-6 font-display text-2xl font-semibold text-azul-marinho">
                Carros que participaram
              </h2>
              {!evento.veiculos_participantes || evento.veiculos_participantes.length === 0 ? (
                <p className="rounded-lg border border-cromo bg-branco p-8 text-center text-texto">
                  Nenhum veículo registrado como participante desta edição.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-cromo bg-branco">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-cromo bg-gelo text-texto">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Veículo</th>
                        <th className="px-4 py-3 font-semibold">Ano</th>
                        <th className="px-4 py-3 font-semibold">Dono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evento.veiculos_participantes.map((veiculo) => (
                        <tr key={veiculo.id} className="border-b border-cromo last:border-0">
                          <td className="px-4 py-3 text-azul-marinho">{veiculo.nome}</td>
                          <td className="px-4 py-3 text-texto">{veiculo.ano}</td>
                          <td className="px-4 py-3 text-texto">{veiculo.proprietario_nome}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchAdmin, ErroApi } from "@/lib/admin-auth";
import type { AgendaEventos, Evento, Inscrito } from "@/types";

const SELO_STATUS: Record<string, string> = {
  aprovado: "bg-azul-claro text-azul-marinho",
  pendente: "bg-gelo text-texto",
  rejeitado: "bg-red-50 text-red-600",
};

type Aba = "visitantes" | "expositores";

export default function AdminInscritosPage() {
  const [agenda, setAgenda] = useState<AgendaEventos | null>(null);
  const [erro, setErro] = useState("");
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<Aba>("expositores");
  const [inscritosPorEvento, setInscritosPorEvento] = useState<Record<number, Inscrito[]>>({});
  const [carregandoInscritos, setCarregandoInscritos] = useState<number | null>(null);
  const [processando, setProcessando] = useState<number | null>(null);

  useEffect(() => {
    fetchAdmin<AgendaEventos>("/api/eventos")
      .then(setAgenda)
      .catch((e) => setErro(e instanceof ErroApi ? e.message : "Erro ao carregar eventos."));
  }, []);

  async function alternarExpandido(evento: Evento) {
    if (expandidoId === evento.id) {
      setExpandidoId(null);
      return;
    }
    setExpandidoId(evento.id);
    setAbaAtiva("expositores");

    if (!inscritosPorEvento[evento.id]) {
      setCarregandoInscritos(evento.id);
      try {
        const inscritos = await fetchAdmin<Inscrito[]>(`/api/inscricoes/evento/${evento.id}`);
        setInscritosPorEvento((atual) => ({ ...atual, [evento.id]: inscritos }));
      } catch (e) {
        setErro(e instanceof ErroApi ? e.message : "Erro ao carregar inscritos.");
      } finally {
        setCarregandoInscritos(null);
      }
    }
  }

  async function definirStatus(eventoId: number, usuarioId: number, status: "aprovado" | "rejeitado") {
    setProcessando(usuarioId);
    setErro("");
    try {
      await fetchAdmin(`/api/usuarios/${usuarioId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setInscritosPorEvento((atual) => ({
        ...atual,
        [eventoId]: atual[eventoId].map((inscrito) =>
          inscrito.usuario_id === usuarioId ? { ...inscrito, usuario_status: status } : inscrito
        ),
      }));
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao atualizar cadastro.");
    } finally {
      setProcessando(null);
    }
  }

  const todosOsEventos = agenda ? [...agenda.proximos, ...agenda.passados] : [];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-azul-marinho">Dashboard de Inscritos</h1>
      <p className="mt-1 text-texto">
        Clique em um evento para ver quem se inscreveu. Visitantes são
        aprovados automaticamente; expositores (donos de veículo) precisam de
        aprovação manual — confira o documento e as fotos do carro antes de decidir.
      </p>

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {agenda === null ? (
          <p className="text-texto">Carregando...</p>
        ) : todosOsEventos.length === 0 ? (
          <p className="rounded-lg border border-cromo bg-branco p-6 text-texto">
            Nenhum evento cadastrado ainda.
          </p>
        ) : (
          todosOsEventos.map((evento) => {
            const expandido = expandidoId === evento.id;
            const inscritos = inscritosPorEvento[evento.id];
            const visitantes = inscritos?.filter((i) => i.tipo === "visitante") ?? [];
            const expositores = inscritos?.filter((i) => i.tipo === "expositor") ?? [];
            const listaAtiva = abaAtiva === "visitantes" ? visitantes : expositores;

            return (
              <div key={evento.id} className="overflow-hidden rounded-lg border border-cromo bg-branco">
                <button
                  type="button"
                  onClick={() => alternarExpandido(evento)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gelo"
                >
                  <div>
                    <p className="font-display text-lg font-semibold text-azul-marinho">{evento.nome}</p>
                    <p className="text-sm text-texto">{evento.data_evento}</p>
                  </div>
                  <span className="text-sm font-semibold text-azul-aco">
                    {inscritos ? `${inscritos.length} inscrito(s)` : "Ver inscritos"} {expandido ? "▲" : "▼"}
                  </span>
                </button>

                {expandido && (
                  <div className="border-t border-cromo">
                    {carregandoInscritos === evento.id ? (
                      <p className="p-6 text-texto">Carregando inscritos...</p>
                    ) : !inscritos || inscritos.length === 0 ? (
                      <p className="p-6 text-texto">Ninguém se inscreveu neste evento ainda.</p>
                    ) : (
                      <>
                        <div className="flex gap-1 border-b border-cromo bg-gelo px-4 pt-3">
                          <button
                            type="button"
                            onClick={() => setAbaAtiva("visitantes")}
                            className={`rounded-t-md px-4 py-2 text-sm font-semibold ${
                              abaAtiva === "visitantes"
                                ? "bg-branco text-azul-marinho"
                                : "text-texto hover:text-azul-marinho"
                            }`}
                          >
                            Inscritos Visitantes ({visitantes.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setAbaAtiva("expositores")}
                            className={`rounded-t-md px-4 py-2 text-sm font-semibold ${
                              abaAtiva === "expositores"
                                ? "bg-branco text-azul-marinho"
                                : "text-texto hover:text-azul-marinho"
                            }`}
                          >
                            Inscritos Expositores ({expositores.length})
                          </button>
                        </div>

                        {listaAtiva.length === 0 ? (
                          <p className="p-6 text-texto">
                            Nenhum {abaAtiva === "visitantes" ? "visitante" : "expositor"} inscrito ainda.
                          </p>
                        ) : abaAtiva === "visitantes" ? (
                          <table className="w-full text-left text-sm">
                            <thead className="border-b border-cromo bg-gelo text-texto">
                              <tr>
                                <th className="px-4 py-3 font-semibold">Nome</th>
                                <th className="px-4 py-3 font-semibold">E-mail</th>
                                <th className="px-4 py-3 font-semibold">Check-in</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visitantes.map((inscrito) => (
                                <tr key={inscrito.inscricao_id} className="border-b border-cromo last:border-0">
                                  <td className="px-4 py-3 text-azul-marinho">{inscrito.nome_completo}</td>
                                  <td className="px-4 py-3 text-texto">{inscrito.email}</td>
                                  <td className="px-4 py-3 text-texto">
                                    {inscrito.checkin_em ? (
                                      <span className="rounded-full bg-azul-claro px-2.5 py-1 text-xs font-semibold text-azul-marinho">
                                        Check-in feito
                                      </span>
                                    ) : (
                                      <span className="text-texto/60">Ainda não</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="flex flex-col divide-y divide-cromo">
                            {expositores.map((inscrito) => (
                              <div key={inscrito.inscricao_id} className="p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold text-azul-marinho">{inscrito.nome_completo}</p>
                                    <p className="text-sm text-texto">{inscrito.email}</p>
                                    <p className="mt-1 text-sm text-texto">
                                      {inscrito.veiculo_nome} — {inscrito.veiculo_modelo} ({inscrito.veiculo_ano})
                                    </p>
                                    {inscrito.veiculo_modificacoes && (
                                      <p className="mt-1 text-sm text-texto/80">{inscrito.veiculo_modificacoes}</p>
                                    )}
                                  </div>
                                  <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${SELO_STATUS[inscrito.usuario_status]}`}
                                  >
                                    {inscrito.usuario_status}
                                  </span>
                                </div>

                                {inscrito.veiculo_documento_url && (
                                  <a
                                    href={inscrito.veiculo_documento_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block text-sm font-semibold text-azul-aco hover:text-azul-marinho"
                                  >
                                    Ver documento do veículo →
                                  </a>
                                )}

                                {inscrito.veiculo_imagens && inscrito.veiculo_imagens.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {inscrito.veiculo_imagens.map((url) => (
                                      <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={url}
                                          alt="Foto do veículo"
                                          className="h-20 w-20 rounded-md object-cover"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                )}

                                {inscrito.usuario_status === "pendente" && (
                                  <div className="mt-3 flex gap-2">
                                    <button
                                      type="button"
                                      disabled={processando === inscrito.usuario_id}
                                      onClick={() => definirStatus(evento.id, inscrito.usuario_id, "aprovado")}
                                      className="rounded-md bg-azul-aco px-3 py-1.5 text-xs font-semibold text-branco hover:bg-azul-marinho disabled:opacity-60"
                                    >
                                      Aprovar
                                    </button>
                                    <button
                                      type="button"
                                      disabled={processando === inscrito.usuario_id}
                                      onClick={() => definirStatus(evento.id, inscrito.usuario_id, "rejeitado")}
                                      className="rounded-md border border-cromo px-3 py-1.5 text-xs font-semibold text-texto hover:bg-gelo disabled:opacity-60"
                                    >
                                      Rejeitar
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

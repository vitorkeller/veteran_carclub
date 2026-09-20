"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { fetchAdmin, ErroApi } from "@/lib/admin-auth";
import { enviarArquivos, ErroUpload } from "@/lib/upload";
import type { AgendaEventos, Evento, Historia, ImagemGaleria, VeiculoParticipante } from "@/types";

const FORM_VAZIO = {
  titulo: "",
  conteudo: "",
  imagemUrl: "",
  eventoId: "",
  destaque: false,
};

const MAX_GALERIA = 50;

export default function AdminHistoriasPage() {
  const [historias, setHistorias] = useState<Historia[] | null>(null);
  const [eventosPassados, setEventosPassados] = useState<AgendaEventos["passados"]>([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Curadoria de veículos em destaque -- depende do evento selecionado.
  const [participantes, setParticipantes] = useState<VeiculoParticipante[]>([]);
  const [veiculosDestaqueIds, setVeiculosDestaqueIds] = useState<number[]>([]);
  const [carregandoParticipantes, setCarregandoParticipantes] = useState(false);

  // Galeria do evento selecionado (até 50 fotos) -- reaproveita os endpoints
  // de galeria do módulo de eventos, já que a história É o resumo do evento.
  const [galeria, setGaleria] = useState<ImagemGaleria[]>([]);
  const [enviandoGaleria, setEnviandoGaleria] = useState(false);
  const inputGaleriaRef = useRef<HTMLInputElement>(null);

  function carregar() {
    fetchAdmin<Historia[]>("/api/historias")
      .then(setHistorias)
      .catch((e) => setErro(e instanceof ErroApi ? e.message : "Erro ao carregar histórias."));
    fetchAdmin<AgendaEventos>("/api/eventos")
      .then((agenda) => setEventosPassados(agenda.passados))
      .catch(() => {
        /* silencioso: só afeta as opções do seletor de evento */
      });
  }

  useEffect(carregar, []);

  /** Busca participantes + galeria do evento escolhido -- chamado ao trocar o select ou ao editar uma história existente. */
  async function carregarDadosDoEvento(eventoId: string, veiculosJaDestacados: number[] = []) {
    setParticipantes([]);
    setGaleria([]);
    setVeiculosDestaqueIds(veiculosJaDestacados);
    if (!eventoId) return;

    setCarregandoParticipantes(true);
    try {
      const [listaParticipantes, detalheEvento] = await Promise.all([
        fetchAdmin<VeiculoParticipante[]>(`/api/eventos/${eventoId}/participantes`),
        fetchAdmin<Evento>(`/api/eventos/${eventoId}`),
      ]);
      setParticipantes(listaParticipantes);
      setGaleria(detalheEvento.galeria ?? []);
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao carregar dados do evento.");
    } finally {
      setCarregandoParticipantes(false);
    }
  }

  async function selecionarEvento(eventoId: string) {
    setForm((atual) => ({ ...atual, eventoId }));
    await carregarDadosDoEvento(eventoId);
  }

  async function editar(historia: Historia) {
    setEditandoId(historia.id);
    setForm({
      titulo: historia.titulo,
      conteudo: historia.conteudo,
      imagemUrl: historia.imagem_url ?? "",
      eventoId: historia.evento_id ? String(historia.evento_id) : "",
      destaque: historia.destaque,
    });

    if (historia.evento_id) {
      // Busca o detalhe da história para saber quais veículos já estão destacados.
      try {
        const detalhe = await fetchAdmin<Historia>(`/api/historias/${historia.id}`);
        await carregarDadosDoEvento(String(historia.evento_id), detalhe.veiculos_destaque_ids ?? []);
      } catch {
        await carregarDadosDoEvento(String(historia.evento_id));
      }
    }
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setParticipantes([]);
    setVeiculosDestaqueIds([]);
    setGaleria([]);
  }

  function alternarVeiculoDestaque(veiculoId: number) {
    setVeiculosDestaqueIds((atual) =>
      atual.includes(veiculoId) ? atual.filter((id) => id !== veiculoId) : [...atual, veiculoId]
    );
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");

    if (!form.eventoId) {
      setErro("Selecione o evento que esta história resume.");
      return;
    }
    setSalvando(true);

    const payload = {
      titulo: form.titulo,
      conteudo: form.conteudo,
      imagemUrl: form.imagemUrl || undefined,
      eventoId: Number(form.eventoId),
      destaque: form.destaque,
      veiculosDestaqueIds,
    };

    try {
      if (editandoId) {
        await fetchAdmin(`/api/historias/${editandoId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchAdmin("/api/historias", { method: "POST", body: JSON.stringify(payload) });
      }
      cancelarEdicao();
      carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao salvar história.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir esta história? Essa ação não pode ser desfeita.")) return;
    setErro("");
    try {
      await fetchAdmin(`/api/historias/${id}`, { method: "DELETE" });
      carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao excluir história.");
    }
  }

  async function adicionarFotosGaleria(arquivos: FileList | null) {
    if (!form.eventoId || !arquivos || arquivos.length === 0) return;
    if (galeria.length + arquivos.length > MAX_GALERIA) {
      setErro(`Este evento já tem ${galeria.length} fotos; o limite é ${MAX_GALERIA}.`);
      return;
    }
    setErro("");
    setEnviandoGaleria(true);
    try {
      const urls = await enviarArquivos(Array.from(arquivos));
      const novasImagens = await fetchAdmin<ImagemGaleria[]>(`/api/eventos/${form.eventoId}/galeria`, {
        method: "POST",
        body: JSON.stringify({ urls }),
      });
      setGaleria((atual) => [...atual, ...novasImagens]);
      if (inputGaleriaRef.current) inputGaleriaRef.current.value = "";
    } catch (e) {
      setErro(e instanceof ErroUpload || e instanceof ErroApi ? e.message : "Erro ao enviar fotos.");
    } finally {
      setEnviandoGaleria(false);
    }
  }

  async function removerFotoGaleria(imagemId: number) {
    if (!form.eventoId) return;
    setErro("");
    try {
      await fetchAdmin(`/api/eventos/${form.eventoId}/galeria/${imagemId}`, { method: "DELETE" });
      setGaleria((atual) => atual.filter((img) => img.id !== imagemId));
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao remover foto.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-azul-marinho">Histórias</h1>
      <p className="mt-1 text-texto">
        Cada história é o recorte/resumo de um evento já realizado. Marcadas
        como destaque aparecem na Home; todas aparecem na página pública de Histórias.
      </p>

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      <form
        onSubmit={salvar}
        className="mt-6 grid gap-4 rounded-lg border border-cromo bg-branco p-6 sm:grid-cols-2"
      >
        <h2 className="col-span-full font-display text-lg font-semibold text-azul-marinho">
          {editandoId ? "Editar história" : "Nova história"}
        </h2>

        <div className="col-span-full">
          <label className="mb-1 block text-sm font-medium text-texto">Evento</label>
          <select
            required
            value={form.eventoId}
            onChange={(e) => selecionarEvento(e.target.value)}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          >
            <option value="">Selecione o evento que esta história resume...</option>
            {eventosPassados.map((evento) => (
              <option key={evento.id} value={evento.id}>
                {evento.nome} — {evento.data_evento}
              </option>
            ))}
          </select>
          {eventosPassados.length === 0 && (
            <p className="mt-1 text-xs text-texto/70">
              Nenhum evento passado cadastrado ainda — crie um evento com data anterior a hoje primeiro.
            </p>
          )}
        </div>

        <div className="col-span-full">
          <label className="mb-1 block text-sm font-medium text-texto">Título</label>
          <input
            required
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div className="col-span-full">
          <label className="mb-1 block text-sm font-medium text-texto">Conteúdo</label>
          <textarea
            required
            rows={4}
            value={form.conteudo}
            onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="destaque"
            type="checkbox"
            checked={form.destaque}
            onChange={(e) => setForm({ ...form, destaque: e.target.checked })}
            className="h-4 w-4 rounded border-cromo text-azul-aco focus:ring-azul-aco"
          />
          <label htmlFor="destaque" className="text-sm text-texto">
            Exibir em destaque na Home
          </label>
        </div>

        {form.eventoId && (
          <>
            <div className="col-span-full border-t border-cromo pt-4">
              <h3 className="font-display text-base font-semibold text-azul-marinho">
                Carros em destaque nesta história
              </h3>
              <p className="mt-1 text-sm text-texto">
                Escolha quais veículos participantes deste evento aparecem com
                fotos e descrição na página pública.
              </p>

              {carregandoParticipantes ? (
                <p className="mt-3 text-sm text-texto">Carregando participantes...</p>
              ) : participantes.length === 0 ? (
                <p className="mt-3 text-sm text-texto">
                  Nenhum veículo se inscreveu como expositor neste evento.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {participantes.map((veiculo) => (
                    <label
                      key={veiculo.id}
                      className="flex items-center gap-2 rounded-md border border-cromo px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={veiculosDestaqueIds.includes(veiculo.id)}
                        onChange={() => alternarVeiculoDestaque(veiculo.id)}
                        className="h-4 w-4 rounded border-cromo text-azul-aco focus:ring-azul-aco"
                      />
                      <span className="text-azul-marinho">{veiculo.nome}</span>
                      <span className="text-texto/70">
                        · {veiculo.ano} · dono: {veiculo.proprietario_nome}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-full border-t border-cromo pt-4">
              <h3 className="font-display text-base font-semibold text-azul-marinho">
                Galeria do evento ({galeria.length}/{MAX_GALERIA})
              </h3>
              <p className="mt-1 text-sm text-texto">
                Essas fotos aparecem no carrossel da página do evento (ligada a esta história).
              </p>

              <input
                ref={inputGaleriaRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => adicionarFotosGaleria(e.target.files)}
                disabled={enviandoGaleria}
                className="mt-3 text-sm text-texto"
              />
              {enviandoGaleria && <p className="mt-1 text-xs text-azul-aco">Enviando fotos...</p>}

              {galeria.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {galeria.map((imagem) => (
                    <div key={imagem.id} className="group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagem.imagem_url}
                        alt={imagem.legenda ?? "Foto do evento"}
                        className="aspect-square w-full rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removerFotoGaleria(imagem.id)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-branco/90 text-xs text-red-600 opacity-0 shadow group-hover:opacity-100"
                        aria-label="Remover foto"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="col-span-full flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-md bg-azul-aco px-6 py-2.5 text-sm font-semibold text-branco hover:bg-azul-marinho disabled:opacity-60"
          >
            {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Criar história"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicao}
              className="rounded-md border border-cromo px-6 py-2.5 text-sm font-semibold text-texto hover:bg-gelo"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-lg border border-cromo bg-branco">
        {historias === null ? (
          <p className="p-6 text-texto">Carregando...</p>
        ) : historias.length === 0 ? (
          <p className="p-6 text-texto">Nenhuma história cadastrada ainda.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cromo bg-gelo text-texto">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Evento</th>
                <th className="px-4 py-3 font-semibold">Destaque</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {historias.map((historia) => (
                <tr key={historia.id} className="border-b border-cromo last:border-0">
                  <td className="px-4 py-3 text-azul-marinho">{historia.titulo}</td>
                  <td className="px-4 py-3 text-texto">{historia.evento_nome ?? "—"}</td>
                  <td className="px-4 py-3 text-texto">{historia.destaque ? "Sim" : "Não"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => editar(historia)}
                        className="rounded-md border border-cromo px-3 py-1.5 text-xs font-semibold text-texto hover:bg-gelo"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(historia.id)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { fetchAdmin, ErroApi } from "@/lib/admin-auth";
import { enviarArquivos, ErroUpload } from "@/lib/upload";
import { CheckinPortaria } from "@/components/admin/CheckinPortaria";
import type { AgendaEventos, Evento, ImagemGaleria } from "@/types";

const FORM_VAZIO = {
  nome: "",
  dataEvento: "",
  horarioInicio: "",
  horarioTermino: "",
  local: "",
  capacidadeMaxima: "600",
  descricao: "",
  imagemCapaUrl: "",
};

const MAX_GALERIA = 50;

export default function AdminEventosPage() {
  const [agenda, setAgenda] = useState<AgendaEventos | null>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [enviandoCapa, setEnviandoCapa] = useState(false);

  // Galeria do evento em edição (só existe depois que o evento já foi criado).
  const [galeria, setGaleria] = useState<ImagemGaleria[]>([]);
  const [enviandoGaleria, setEnviandoGaleria] = useState(false);
  const inputGaleriaRef = useRef<HTMLInputElement>(null);

  function carregar() {
    fetchAdmin<AgendaEventos>("/api/eventos")
      .then(setAgenda)
      .catch((e) => setErro(e instanceof ErroApi ? e.message : "Erro ao carregar eventos."));
  }

  useEffect(carregar, []);

  async function editar(evento: Evento) {
    setEditandoId(evento.id);
    setForm({
      nome: evento.nome,
      dataEvento: evento.data_evento,
      horarioInicio: evento.horario_inicio?.slice(0, 5) ?? "",
      horarioTermino: evento.horario_termino?.slice(0, 5) ?? "",
      local: evento.local ?? "",
      capacidadeMaxima: String(evento.capacidade_maxima),
      descricao: evento.descricao ?? "",
      imagemCapaUrl: evento.imagem_capa_url ?? "",
    });

    // Busca o detalhe (que traz a galeria, se o evento já passou).
    try {
      const detalhe = await fetchAdmin<Evento>(`/api/eventos/${evento.id}`);
      setGaleria(detalhe.galeria ?? []);
    } catch {
      setGaleria([]);
    }
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setGaleria([]);
  }

  async function selecionarCapa(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro("");
    setEnviandoCapa(true);
    try {
      const [url] = await enviarArquivos([arquivo]);
      setForm((atual) => ({ ...atual, imagemCapaUrl: url }));
    } catch (e) {
      setErro(e instanceof ErroUpload ? e.message : "Erro ao enviar a imagem de capa.");
    } finally {
      setEnviandoCapa(false);
    }
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);

    const payload = {
      nome: form.nome,
      dataEvento: form.dataEvento,
      horarioInicio: form.horarioInicio,
      horarioTermino: form.horarioTermino,
      local: form.local || undefined,
      capacidadeMaxima: Number(form.capacidadeMaxima),
      descricao: form.descricao || undefined,
      imagemCapaUrl: form.imagemCapaUrl || undefined,
    };

    try {
      if (editandoId) {
        await fetchAdmin(`/api/eventos/${editandoId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchAdmin("/api/eventos", { method: "POST", body: JSON.stringify(payload) });
      }
      cancelarEdicao();
      carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao salvar evento.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este evento? Essa ação não pode ser desfeita.")) return;
    setErro("");
    try {
      await fetchAdmin(`/api/eventos/${id}`, { method: "DELETE" });
      carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao excluir evento.");
    }
  }

  async function adicionarFotosGaleria(arquivos: FileList | null) {
    if (!editandoId || !arquivos || arquivos.length === 0) return;
    if (galeria.length + arquivos.length > MAX_GALERIA) {
      setErro(`Este evento já tem ${galeria.length} fotos; o limite é ${MAX_GALERIA}.`);
      return;
    }
    setErro("");
    setEnviandoGaleria(true);
    try {
      const urls = await enviarArquivos(Array.from(arquivos));
      const novasImagens = await fetchAdmin<ImagemGaleria[]>(`/api/eventos/${editandoId}/galeria`, {
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
    if (!editandoId) return;
    setErro("");
    try {
      await fetchAdmin(`/api/eventos/${editandoId}/galeria/${imagemId}`, { method: "DELETE" });
      setGaleria((atual) => atual.filter((img) => img.id !== imagemId));
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao remover foto.");
    }
  }

  const todosOsEventos = agenda ? [...agenda.proximos, ...agenda.passados] : [];
  const eventoJaAconteceu = editandoId != null && form.dataEvento < new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-azul-marinho">Eventos</h1>
      <p className="mt-1 text-texto">
        Sempre em Joinville, no máximo um evento por dia — o banco garante isso automaticamente.
      </p>

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      <form
        onSubmit={salvar}
        className="mt-6 grid gap-4 rounded-lg border border-cromo bg-branco p-6 sm:grid-cols-2"
      >
        <h2 className="col-span-full font-display text-lg font-semibold text-azul-marinho">
          {editandoId ? "Editar evento" : "Novo evento"}
        </h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Nome</label>
          <input
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Data</label>
          <input
            required
            type="date"
            value={form.dataEvento}
            onChange={(e) => setForm({ ...form, dataEvento: e.target.value })}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Horário de início</label>
          <input
            required
            type="time"
            value={form.horarioInicio}
            onChange={(e) => setForm({ ...form, horarioInicio: e.target.value })}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Horário de término</label>
          <input
            required
            type="time"
            value={form.horarioTermino}
            onChange={(e) => setForm({ ...form, horarioTermino: e.target.value })}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">Local</label>
          <input
            value={form.local}
            onChange={(e) => setForm({ ...form, local: e.target.value })}
            placeholder="Ex.: Expoville"
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">
            Capacidade máxima (até 600)
          </label>
          <input
            type="number"
            min={1}
            max={600}
            value={form.capacidadeMaxima}
            onChange={(e) => setForm({ ...form, capacidadeMaxima: e.target.value })}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div className="col-span-full">
          <label className="mb-1 block text-sm font-medium text-texto">Descrição</label>
          <textarea
            rows={3}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-texto">
            Imagem de capa (1 foto — usada na Agenda)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => selecionarCapa(e.target.files?.[0])}
            className="w-full text-sm text-texto"
          />
          {enviandoCapa && <p className="mt-1 text-xs text-azul-aco">Enviando...</p>}
          {form.imagemCapaUrl && !enviandoCapa && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imagemCapaUrl} alt="Capa do evento" className="mt-2 h-24 w-32 rounded-md object-cover" />
          )}
        </div>

        <div className="col-span-full flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-md bg-azul-aco px-6 py-2.5 text-sm font-semibold text-branco hover:bg-azul-marinho disabled:opacity-60"
          >
            {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Criar evento"}
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

      {editandoId && (
        <div className="mt-6">
          <CheckinPortaria eventoId={editandoId} />
        </div>
      )}

      {editandoId && eventoJaAconteceu && (
        <div className="mt-6 rounded-lg border border-cromo bg-branco p-6">
          <h2 className="font-display text-lg font-semibold text-azul-marinho">
            Galeria do evento ({galeria.length}/{MAX_GALERIA})
          </h2>
          <p className="mt-1 text-sm text-texto">
            Fotos exibidas na página de detalhe deste encontro (histórias/agenda).
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
      )}

      <div className="mt-8 overflow-hidden rounded-lg border border-cromo bg-branco">
        {agenda === null ? (
          <p className="p-6 text-texto">Carregando...</p>
        ) : todosOsEventos.length === 0 ? (
          <p className="p-6 text-texto">Nenhum evento cadastrado ainda.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cromo bg-gelo text-texto">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Horário</th>
                <th className="px-4 py-3 font-semibold">Local</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {todosOsEventos.map((evento) => (
                <tr key={evento.id} className="border-b border-cromo last:border-0">
                  <td className="px-4 py-3 text-azul-marinho">{evento.nome}</td>
                  <td className="px-4 py-3 text-texto">{evento.data_evento}</td>
                  <td className="px-4 py-3 text-texto">
                    {evento.horario_inicio ? evento.horario_inicio.slice(0, 5) : "—"}
                  </td>
                  <td className="px-4 py-3 text-texto">{evento.local ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-texto">{evento.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => editar(evento)}
                        className="rounded-md border border-cromo px-3 py-1.5 text-xs font-semibold text-texto hover:bg-gelo"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(evento.id)}
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

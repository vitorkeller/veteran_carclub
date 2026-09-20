"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fetchAdmin, ErroApi } from "@/lib/admin-auth";
import { enviarArquivos, ErroUpload } from "@/lib/upload";
import type { VeiculoAdmin } from "@/types";

const MAX_IMAGENS = 10;

export default function AdminVeiculosPage() {
  const [veiculos, setVeiculos] = useState<VeiculoAdmin[] | null>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", modelo: "", ano: "", modificacoes: "" });
  const [imagensEditando, setImagensEditando] = useState<VeiculoAdmin["imagens"]>([]);
  const [enviandoImagens, setEnviandoImagens] = useState(false);

  function carregar() {
    fetchAdmin<VeiculoAdmin[]>("/api/veiculos/painel")
      .then(setVeiculos)
      .catch((e) => setErro(e instanceof ErroApi ? e.message : "Erro ao carregar veículos."));
  }

  useEffect(carregar, []);

  function editar(veiculo: VeiculoAdmin) {
    setEditandoId(veiculo.id);
    setForm({
      nome: veiculo.nome,
      modelo: veiculo.modelo,
      ano: String(veiculo.ano),
      modificacoes: veiculo.modificacoes ?? "",
    });
    setImagensEditando(veiculo.imagens);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm({ nome: "", modelo: "", ano: "", modificacoes: "" });
    setImagensEditando([]);
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (!editandoId) return;
    setErro("");
    setSalvando(true);

    try {
      await fetchAdmin(`/api/veiculos/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: form.nome,
          modelo: form.modelo,
          ano: Number(form.ano),
          modificacoes: form.modificacoes || undefined,
        }),
      });
      cancelarEdicao();
      carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao salvar veículo.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: number) {
    if (!confirm("Remover este veículo do acervo? Essa ação não pode ser desfeita.")) return;
    setErro("");
    try {
      await fetchAdmin(`/api/veiculos/${id}`, { method: "DELETE" });
      carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao excluir veículo.");
    }
  }

  async function alternarPublicacao(veiculo: VeiculoAdmin) {
    setErro("");
    try {
      await fetchAdmin(`/api/veiculos/${veiculo.id}/acervo`, {
        method: "PATCH",
        body: JSON.stringify({ publicado: !veiculo.publicado_acervo }),
      });
      carregar();
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao atualizar a curadoria.");
    }
  }

  async function adicionarImagens(arquivos: FileList | null) {
    if (!editandoId || !arquivos || arquivos.length === 0) return;
    if (imagensEditando.length + arquivos.length > MAX_IMAGENS) {
      setErro(`Este veículo já tem ${imagensEditando.length} imagens; o limite é ${MAX_IMAGENS}.`);
      return;
    }
    setErro("");
    setEnviandoImagens(true);
    try {
      const urls = await enviarArquivos(Array.from(arquivos));
      const novasImagens = await fetchAdmin<VeiculoAdmin["imagens"]>(`/api/veiculos/${editandoId}/imagens`, {
        method: "POST",
        body: JSON.stringify({ urls }),
      });
      setImagensEditando((atual) => [...atual, ...novasImagens]);
    } catch (e) {
      setErro(e instanceof ErroUpload || e instanceof ErroApi ? e.message : "Erro ao enviar imagens.");
    } finally {
      setEnviandoImagens(false);
    }
  }

  async function removerImagem(imagemId: number) {
    if (!editandoId) return;
    setErro("");
    try {
      await fetchAdmin(`/api/veiculos/${editandoId}/imagens/${imagemId}`, { method: "DELETE" });
      setImagensEditando((atual) => atual.filter((img) => img.id !== imagemId));
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao remover imagem.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-azul-marinho">Veículos</h1>
      <p className="mt-1 text-texto">
        Cada veículo é cadastrado pelo próprio dono no momento da inscrição como expositor.
        Aqui o admin corrige fichas, gerencia as fotos e decide quais carros aparecem
        na vitrine pública do Acervo.
      </p>

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      {editandoId && (
        <form
          onSubmit={salvar}
          className="mt-6 grid gap-4 rounded-lg border border-cromo bg-branco p-6 sm:grid-cols-2"
        >
          <h2 className="col-span-full font-display text-lg font-semibold text-azul-marinho">
            Editar veículo #{editandoId}
          </h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Nome/apelido</label>
            <input
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Modelo</label>
            <input
              required
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-texto">Ano</label>
            <input
              required
              type="number"
              value={form.ano}
              onChange={(e) => setForm({ ...form, ano: e.target.value })}
              className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
            />
          </div>

          <div className="col-span-full">
            <label className="mb-1 block text-sm font-medium text-texto">Modificações</label>
            <textarea
              rows={3}
              value={form.modificacoes}
              onChange={(e) => setForm({ ...form, modificacoes: e.target.value })}
              className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
            />
          </div>

          <div className="col-span-full border-t border-cromo pt-4">
            <h3 className="font-display text-base font-semibold text-azul-marinho">
              Fotos ({imagensEditando.length}/{MAX_IMAGENS})
            </h3>

            {imagensEditando.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {imagensEditando.map((imagem) => (
                  <div key={imagem.id} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagem.url}
                      alt="Foto do veículo"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removerImagem(imagem.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-branco/90 text-xs text-red-600 opacity-0 shadow group-hover:opacity-100"
                      aria-label="Remover foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => adicionarImagens(e.target.files)}
              disabled={enviandoImagens}
              className="mt-3 text-sm text-texto"
            />
            {enviandoImagens && <p className="mt-1 text-xs text-azul-aco">Enviando...</p>}
          </div>

          <div className="col-span-full flex gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-md bg-azul-aco px-6 py-2.5 text-sm font-semibold text-branco hover:bg-azul-marinho disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
            <button
              type="button"
              onClick={cancelarEdicao}
              className="rounded-md border border-cromo px-6 py-2.5 text-sm font-semibold text-texto hover:bg-gelo"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-hidden rounded-lg border border-cromo bg-branco">
        {veiculos === null ? (
          <p className="p-6 text-texto">Carregando...</p>
        ) : veiculos.length === 0 ? (
          <p className="p-6 text-texto">Nenhum veículo cadastrado ainda.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cromo bg-gelo text-texto">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Modelo / Ano</th>
                <th className="px-4 py-3 font-semibold">Dono</th>
                <th className="px-4 py-3 font-semibold">Fotos</th>
                <th className="px-4 py-3 font-semibold">Acervo</th>
                <th className="px-4 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((veiculo) => (
                <tr key={veiculo.id} className="border-b border-cromo last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-texto">{veiculo.id}</td>
                  <td className="px-4 py-3 text-azul-marinho">{veiculo.nome}</td>
                  <td className="px-4 py-3 text-texto">
                    {veiculo.modelo} · {veiculo.ano}
                  </td>
                  <td className="px-4 py-3 text-texto">{veiculo.proprietario_nome}</td>
                  <td className="px-4 py-3 text-texto">{veiculo.imagens.length}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        veiculo.publicado_acervo
                          ? "bg-azul-claro text-azul-marinho"
                          : "bg-gelo text-texto"
                      }`}
                    >
                      {veiculo.publicado_acervo ? "Publicado" : "Não publicado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => alternarPublicacao(veiculo)}
                        className="rounded-md bg-azul-aco px-3 py-1.5 text-xs font-semibold text-branco hover:bg-azul-marinho"
                      >
                        {veiculo.publicado_acervo ? "Remover do Acervo" : "Publicar no Acervo"}
                      </button>
                      <button
                        type="button"
                        onClick={() => editar(veiculo)}
                        className="rounded-md border border-cromo px-3 py-1.5 text-xs font-semibold text-texto hover:bg-gelo"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(veiculo.id)}
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

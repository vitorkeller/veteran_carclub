"use client";

import { useState, type FormEvent } from "react";
import { API_URL } from "@/lib/api";
import { enviarArquivos, ErroUpload } from "@/lib/upload";
import type { TipoUsuario } from "@/types";

const MAX_IMAGENS_VEICULO = 10;

type Props = {
  eventoId: number;
  eventoNome?: string | null;
};

export function InscricaoForm({ eventoId, eventoNome }: Props) {
  const [tipo, setTipo] = useState<TipoUsuario>("visitante");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");

  // Campos exclusivos do fluxo expositor.
  const [veiculoNome, setVeiculoNome] = useState("");
  const [veiculoModelo, setVeiculoModelo] = useState("");
  const [veiculoAno, setVeiculoAno] = useState("");
  const [veiculoModificacoes, setVeiculoModificacoes] = useState("");
  const [documento, setDocumento] = useState<File | null>(null);
  const [imagens, setImagens] = useState<File[]>([]);

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  function selecionarImagens(arquivos: FileList | null) {
    if (!arquivos) return;
    const lista = Array.from(arquivos).slice(0, MAX_IMAGENS_VEICULO);
    if (arquivos.length > MAX_IMAGENS_VEICULO) {
      setErro(`Só é possível enviar até ${MAX_IMAGENS_VEICULO} imagens — as primeiras ${MAX_IMAGENS_VEICULO} foram selecionadas.`);
    }
    setImagens(lista);
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      let payload: Record<string, unknown> = {
        tipo,
        nomeCompleto,
        email,
        instagram: instagram || undefined,
        eventoId,
      };

      if (tipo === "expositor") {
        if (!documento) {
          throw new Error("Envie o documento do veículo para continuar.");
        }
        const [documentoUrl] = await enviarArquivos([documento]);
        const imagensUrls = imagens.length > 0 ? await enviarArquivos(imagens) : undefined;

        payload = {
          ...payload,
          veiculo: {
            nome: veiculoNome,
            modelo: veiculoModelo,
            ano: Number(veiculoAno),
            documentoUrl,
            modificacoes: veiculoModificacoes || undefined,
            imagens: imagensUrls,
          },
        };
      }

      const resposta = await fetch(`${API_URL}/api/usuarios/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "Não foi possível concluir o cadastro.");

      setSucesso(true);
    } catch (e) {
      setErro(e instanceof ErroUpload || e instanceof Error ? e.message : "Não foi possível concluir o cadastro.");
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="rounded-lg border border-cromo bg-branco p-8 text-center">
        {tipo === "visitante" ? (
          <>
            <p className="font-display text-2xl font-semibold text-azul-marinho">
              Inscrição confirmada!
            </p>
            <p className="mt-3 text-texto">
              Você já está inscrito{eventoNome ? <> em <span className="font-semibold text-azul-marinho">{eventoNome}</span></> : ""}.
              Nos vemos por lá!
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-2xl font-semibold text-azul-marinho">Cadastro enviado!</p>
            <p className="mt-3 text-texto">
              Sua vaga{eventoNome ? <> em <span className="font-semibold text-azul-marinho">{eventoNome}</span></> : ""} está
              reservada, mas o cadastro do seu veículo ainda precisa da aprovação do clube antes de ser confirmado. Você será avisado assim que isso acontecer.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded-lg border border-cromo bg-branco p-8">
      {eventoNome && (
        <p className="mb-6 rounded-md bg-gelo px-4 py-3 text-sm text-texto">
          Inscrição para <span className="font-semibold text-azul-marinho">{eventoNome}</span>.
        </p>
      )}

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTipo("visitante")}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
            tipo === "visitante" ? "bg-azul-aco text-branco" : "bg-gelo text-texto hover:bg-azul-claro/50"
          }`}
        >
          Sou visitante
        </button>
        <button
          type="button"
          onClick={() => setTipo("expositor")}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
            tipo === "expositor" ? "bg-azul-aco text-branco" : "bg-gelo text-texto hover:bg-azul-claro/50"
          }`}
        >
          Sou expositor
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-texto">Nome completo</label>
          <input
            required
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-texto">E-mail</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-texto">Instagram (opcional)</label>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@seuusuario"
            className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
          />
        </div>

        {tipo === "expositor" && (
          <>
            <div className="sm:col-span-2 mt-2 border-t border-cromo pt-4">
              <h2 className="font-display text-lg font-semibold text-azul-marinho">Seu veículo</h2>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Nome/apelido do carro</label>
              <input
                required
                value={veiculoNome}
                onChange={(e) => setVeiculoNome(e.target.value)}
                placeholder="Ex.: Fusca Azul"
                className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Modelo</label>
              <input
                required
                value={veiculoModelo}
                onChange={(e) => setVeiculoModelo(e.target.value)}
                placeholder="Ex.: Volkswagen Fusca 1300"
                className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-texto">Ano</label>
              <input
                required
                type="number"
                min={1885}
                max={new Date().getFullYear() + 1}
                value={veiculoAno}
                onChange={(e) => setVeiculoAno(e.target.value)}
                className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-texto">
                Documento do veículo (imagem ou PDF)
              </label>
              <input
                required
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setDocumento(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-texto"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-texto">Modificações (opcional)</label>
              <textarea
                rows={3}
                value={veiculoModificacoes}
                onChange={(e) => setVeiculoModificacoes(e.target.value)}
                className="w-full rounded-md border border-cromo px-3 py-2 focus:border-azul-aco focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-texto">
                Fotos do veículo (até {MAX_IMAGENS_VEICULO})
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => selecionarImagens(e.target.files)}
                className="w-full text-sm text-texto"
              />
              {imagens.length > 0 && (
                <p className="mt-1 text-xs text-texto/70">{imagens.length} foto(s) selecionada(s).</p>
              )}
            </div>
          </>
        )}
      </div>

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="mt-6 w-full rounded-md bg-azul-aco px-6 py-3 text-sm font-semibold text-branco transition-colors hover:bg-azul-marinho disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Concluir cadastro"}
      </button>
    </form>
  );
}

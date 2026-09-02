"use client";

import { useState, type FormEvent } from "react";
import { fetchAdmin, ErroApi } from "@/lib/admin-auth";
import type { CheckinResultado } from "@/types";

export function CheckinPortaria({ eventoId }: { eventoId: number }) {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<CheckinResultado | null>(null);
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);

  async function fazerCheckin(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setResultado(null);
    if (!codigo.trim()) return;

    setProcessando(true);
    try {
      const resposta = await fetchAdmin<CheckinResultado>(`/api/inscricoes/evento/${eventoId}/checkin`, {
        method: "POST",
        body: JSON.stringify({ codigo: codigo.trim() }),
      });
      setResultado(resposta);
      setCodigo("");
    } catch (e) {
      setErro(e instanceof ErroApi ? e.message : "Erro ao fazer check-in.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="rounded-lg border border-cromo bg-branco p-6">
      <h2 className="font-display text-lg font-semibold text-azul-marinho">Check-in na portaria</h2>
      <p className="mt-1 text-sm text-texto">
        Digite o código de 6 caracteres apresentado pela pessoa na entrada do evento.
      </p>

      <form onSubmit={fazerCheckin} className="mt-4 flex gap-2">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Ex.: A3F9K2"
          maxLength={6}
          autoComplete="off"
          className="flex-1 rounded-md border border-cromo px-3 py-2 font-mono uppercase tracking-widest focus:border-azul-aco focus:outline-none"
        />
        <button
          type="submit"
          disabled={processando}
          className="rounded-md bg-azul-aco px-6 py-2 text-sm font-semibold text-branco hover:bg-azul-marinho disabled:opacity-60"
        >
          {processando ? "Verificando..." : "Confirmar"}
        </button>
      </form>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

      {resultado && (
        <div className="mt-3 rounded-md bg-azul-claro/30 p-4">
          <p className="font-semibold text-azul-marinho">✓ Check-in confirmado: {resultado.nomeCompleto}</p>
          <p className="text-sm text-texto capitalize">
            {resultado.tipo}
            {resultado.veiculoNome && ` · ${resultado.veiculoNome}`}
          </p>
        </div>
      )}
    </div>
  );
}

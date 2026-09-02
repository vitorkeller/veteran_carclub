"use client";

import { useSyncExternalStore } from "react";
import type { Usuario } from "@/types";
import { API_URL } from "./api";

const CHAVE_SESSAO = "veteran_carclub_admin_sessao";

export type Sessao = {
  token: string;
  usuario: Usuario;
};

/**
 * Sessão guardada no localStorage do navegador -- suficiente para o "início"
 * do painel administrativo. Não é um mecanismo de auth de produção (não tem
 * refresh token, renovação silenciosa, nem httpOnly cookies): para produção,
 * o próximo passo é mover isso para cookies httpOnly com um endpoint de
 * refresh no backend.
 */
function lerDoStorage(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    return bruto ? (JSON.parse(bruto) as Sessao) : null;
  } catch {
    return null;
  }
}

// Cache em memória + inscritos: dá ao useSyncExternalStore uma referência
// estável (só muda quando salvarSessao/limparSessao são chamados), em vez de
// reler e reanalisar o JSON a cada render.
let sessaoCache: Sessao | null | undefined;
const ouvintes = new Set<() => void>();

function notificarOuvintes() {
  ouvintes.forEach((callback) => callback());
}

export function salvarSessao(sessao: Sessao) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  sessaoCache = sessao;
  notificarOuvintes();
}

export function obterSessao(): Sessao | null {
  if (sessaoCache === undefined) sessaoCache = lerDoStorage();
  return sessaoCache;
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  sessaoCache = null;
  notificarOuvintes();
}

function inscrever(callback: () => void) {
  ouvintes.add(callback);
  return () => ouvintes.delete(callback);
}

function obterSnapshotServidor(): Sessao | null {
  return null; // no servidor não há localStorage; corrige assim que hidrata no client
}

/** Hook reativo: re-renderiza quando login/logout acontece em qualquer parte da árvore. */
export function useSessaoAdmin(): Sessao | null {
  return useSyncExternalStore(inscrever, obterSessao, obterSnapshotServidor);
}

export class ErroApi extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

/** fetch com Authorization: Bearer <token> + tratamento padrão de erro da API. */
export async function fetchAdmin<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const sessao = obterSessao();
  if (!sessao) throw new ErroApi(401, "Sessão expirada. Faça login novamente.");

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessao.token}`,
      ...opcoes.headers,
    },
  });

  if (resposta.status === 401 || resposta.status === 403) {
    if (resposta.status === 401) limparSessao();
    const corpo = await resposta.json().catch(() => ({}));
    throw new ErroApi(resposta.status, corpo.erro ?? "Acesso negado.");
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    throw new ErroApi(resposta.status, corpo.erro ?? "Erro ao comunicar com a API.");
  }

  if (resposta.status === 204) return undefined as T;
  return resposta.json();
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { salvarSessao } from "@/lib/admin-auth";
import type { Usuario } from "@/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const corpo = await resposta.json();

      if (!resposta.ok) {
        throw new Error(corpo.erro ?? "Não foi possível entrar.");
      }

      const usuario: Usuario = corpo.usuario;
      if (usuario.tipo !== "admin") {
        throw new Error("Este acesso é restrito a administradores do clube.");
      }

      salvarSessao({ token: corpo.token, usuario });
      router.push("/admin");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-azul-marinho px-6">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-lg border border-azul-claro/20 bg-branco p-8 shadow-lg"
      >
        <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-aco">
          Veteran Carclub
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-azul-marinho">
          Painel administrativo
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-texto">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-cromo px-4 py-2 focus:border-azul-aco focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-texto">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-md border border-cromo px-4 py-2 focus:border-azul-aco focus:outline-none"
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 rounded-md bg-azul-aco px-6 py-2.5 text-sm font-semibold text-branco transition-colors hover:bg-azul-marinho disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </main>
  );
}

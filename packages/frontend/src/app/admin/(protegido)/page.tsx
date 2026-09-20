"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdmin, ErroApi } from "@/lib/admin-auth";
import type { AgendaEventos, Usuario, VeiculoAcervo } from "@/types";

const ATALHOS = [
  {
    href: "/admin/usuarios",
    titulo: "Dashboard de Inscritos",
    descricao: "Ver quem se inscreveu em cada evento e aprovar expositores pendentes.",
  },
  {
    href: "/admin/eventos",
    titulo: "Eventos",
    descricao: "Criar e gerenciar os encontros do clube.",
  },
  {
    href: "/admin/historias",
    titulo: "Histórias",
    descricao: "Cadastrar e editar as histórias exibidas no site.",
  },
  {
    href: "/admin/veiculos",
    titulo: "Veículos",
    descricao: "Corrigir ou remover fichas do acervo.",
  },
];

export default function AdminDashboardPage() {
  const [pendentes, setPendentes] = useState<Usuario[] | null>(null);
  const [agenda, setAgenda] = useState<AgendaEventos | null>(null);
  const [veiculos, setVeiculos] = useState<VeiculoAcervo[] | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([
      fetchAdmin<Usuario[]>("/api/usuarios/pendentes"),
      fetchAdmin<AgendaEventos>("/api/eventos"),
      fetchAdmin<VeiculoAcervo[]>("/api/veiculos"),
    ])
      .then(([u, e, v]) => {
        setPendentes(u);
        setAgenda(e);
        setVeiculos(v);
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.message : "Erro ao carregar o dashboard."));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-azul-marinho">Início</h1>
      <p className="mt-1 text-texto">Visão geral do clube.</p>

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-cromo bg-branco p-6">
          <p className="text-3xl font-semibold text-azul-marinho">{pendentes?.length ?? "—"}</p>
          <p className="text-sm text-texto">Cadastros aguardando aprovação</p>
        </div>
        <div className="rounded-lg border border-cromo bg-branco p-6">
          <p className="text-3xl font-semibold text-azul-marinho">{agenda?.proximos.length ?? "—"}</p>
          <p className="text-sm text-texto">Eventos futuros agendados</p>
        </div>
        <div className="rounded-lg border border-cromo bg-branco p-6">
          <p className="text-3xl font-semibold text-azul-marinho">{veiculos?.length ?? "—"}</p>
          <p className="text-sm text-texto">Veículos no acervo</p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {ATALHOS.map((atalho) => (
          <Link
            key={atalho.href}
            href={atalho.href}
            className="rounded-lg border border-cromo bg-branco p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="font-display text-lg font-semibold text-azul-marinho">
              {atalho.titulo}
            </h2>
            <p className="mt-1 text-sm text-texto">{atalho.descricao}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { limparSessao, useSessaoAdmin } from "@/lib/admin-auth";

const LINKS = [
  { href: "/admin", rotulo: "Início", exato: true },
  { href: "/admin/usuarios", rotulo: "Inscritos" },
  { href: "/admin/eventos", rotulo: "Eventos" },
  { href: "/admin/historias", rotulo: "Histórias" },
  { href: "/admin/veiculos", rotulo: "Veículos" },
];

export default function AdminProtegidoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sessao = useSessaoAdmin();
  const semAcesso = sessao === null || sessao.usuario.tipo !== "admin";

  useEffect(() => {
    if (semAcesso) router.replace("/admin/login");
  }, [semAcesso, router]);

  function sair() {
    limparSessao();
    router.replace("/admin/login");
  }

  if (semAcesso) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gelo">
        <p className="text-texto">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gelo">
      <aside className="flex w-64 shrink-0 flex-col border-r border-cromo bg-azul-marinho px-4 py-6 text-branco">
        <p className="px-2 font-display text-lg font-semibold uppercase tracking-wide">
          Veteran <span className="text-azul-claro">Carclub</span>
        </p>
        <p className="mb-8 px-2 text-xs text-azul-claro/70">Painel administrativo</p>

        <nav className="flex flex-1 flex-col gap-1">
          {LINKS.map((link) => {
            const ativo = link.exato ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  ativo ? "bg-azul-aco text-branco" : "text-azul-claro/80 hover:bg-branco/10"
                }`}
              >
                {link.rotulo}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-azul-claro/20 pt-4 text-xs text-azul-claro/70">
          <p className="truncate">{sessao.usuario.nome_completo}</p>
          <button
            type="button"
            onClick={sair}
            className="mt-2 text-azul-claro underline-offset-2 hover:underline"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

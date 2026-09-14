"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/agenda", rotulo: "Agenda" },
  { href: "/acervo", rotulo: "Acervo" },
  { href: "/historias", rotulo: "Histórias" },
  { href: "/#contato", rotulo: "Contato" },
];

export function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-cromo/60 bg-branco/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-azul-marinho"
        >
          <Image
            src="/logo.jpg"
            alt="Logo Veteran Carclub"
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
            priority
          />
          Veteran <span className="text-azul-aco">Carclub</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-texto transition-colors hover:text-azul-aco"
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
        >
          <span className="h-0.5 w-6 bg-azul-marinho" />
          <span className="h-0.5 w-6 bg-azul-marinho" />
          <span className="h-0.5 w-6 bg-azul-marinho" />
        </button>
      </div>

      {menuAberto && (
        <nav className="flex flex-col gap-1 border-t border-cromo/60 bg-branco px-6 py-4 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuAberto(false)}
              className="py-2 text-sm font-medium text-texto"
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

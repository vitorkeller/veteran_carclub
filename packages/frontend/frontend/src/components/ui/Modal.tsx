"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  aberto: boolean;
  aoFechar: () => void;
  children: React.ReactNode;
};

export function Modal({ aberto, aoFechar, children }: ModalProps) {
  useEffect(() => {
    if (!aberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") aoFechar();
    }
    document.addEventListener("keydown", aoPressionarTecla);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoPressionarTecla);
      document.body.style.overflow = "";
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={aoFechar}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-azul-marinho/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(evento) => evento.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-branco shadow-xl"
      >
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-branco/90 text-azul-marinho shadow hover:bg-gelo"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

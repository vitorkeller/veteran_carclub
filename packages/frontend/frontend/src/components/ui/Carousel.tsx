"use client";

import { useState } from "react";

export function Carousel({ imagens, alt }: { imagens: string[]; alt: string }) {
  const [indice, setIndice] = useState(0);

  if (imagens.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center bg-gelo text-sm text-texto/60">
        Sem imagens
      </div>
    );
  }

  function anterior() {
    setIndice((atual) => (atual === 0 ? imagens.length - 1 : atual - 1));
  }
  function proxima() {
    setIndice((atual) => (atual === imagens.length - 1 ? 0 : atual + 1));
  }

  return (
    <div className="relative">
      <div className="relative aspect-video overflow-hidden bg-azul-marinho">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagens vêm do próprio backend (upload local), fora do domínio otimizável do next/image em dev */}
        <img
          src={imagens[indice]}
          alt={`${alt} — foto ${indice + 1} de ${imagens.length}`}
          className="h-full w-full object-cover"
        />
      </div>

      {imagens.length > 1 && (
        <>
          <button
            type="button"
            onClick={anterior}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-branco/90 text-azul-marinho shadow hover:bg-branco"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={proxima}
            aria-label="Próxima foto"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-branco/90 text-azul-marinho shadow hover:bg-branco"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {imagens.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndice(i)}
                aria-label={`Ir para foto ${i + 1}`}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === indice ? "bg-branco" : "bg-branco/40"
                }`}
              />
            ))}
          </div>

          <p className="absolute right-3 top-3 rounded-full bg-azul-marinho/80 px-2.5 py-0.5 font-mono text-xs text-branco">
            {indice + 1}/{imagens.length}
          </p>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { VeiculoCard } from "@/components/veiculos/VeiculoCard";
import { VeiculoModal } from "@/components/veiculos/VeiculoModal";
import type { VeiculoAcervo } from "@/types";

export function AcervoGaleria({ veiculos }: { veiculos: VeiculoAcervo[] }) {
  const [selecionado, setSelecionado] = useState<VeiculoAcervo | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {veiculos.map((veiculo) => (
          <VeiculoCard key={veiculo.id} veiculo={veiculo} aoClicar={() => setSelecionado(veiculo)} />
        ))}
      </div>

      <Modal aberto={selecionado !== null} aoFechar={() => setSelecionado(null)}>
        {selecionado && <VeiculoModal veiculo={selecionado} />}
      </Modal>
    </>
  );
}

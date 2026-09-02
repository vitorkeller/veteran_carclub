type PlacaProps = {
  rotulo: string;
  valor: string;
  className?: string;
};

/**
 * Placa cromada inspirada em emplacamento de carros antigos — o motivo visual
 * assinatura do site. Usada para datas de evento, tags e destaques pontuais.
 * Não usar em excesso: funciona porque é rara.
 */
export function Placa({ rotulo, valor, className = "" }: PlacaProps) {
  return (
    <div
      className={`inline-flex flex-col items-center rounded-md border-2 border-cromo bg-branco px-4 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] ${className}`}
    >
      <span className="font-mono text-[10px] font-medium tracking-[0.2em] text-azul-aco uppercase">
        {rotulo}
      </span>
      <span className="font-mono text-lg font-medium tracking-[0.15em] text-azul-marinho">
        {valor}
      </span>
    </div>
  );
}

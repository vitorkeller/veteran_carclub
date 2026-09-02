const MESES_ABREVIADOS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

/**
 * Extrai só a parte "AAAA-MM-DD" de uma data, aceitando tanto esse formato
 * quanto um ISO completo com horário (defensivo: o backend já devolve string
 * plana, mas isso evita que a UI quebre se algum dia vier diferente).
 */
function apenasData(dataIso: string) {
  return dataIso.split("T")[0];
}

/** "2026-09-20" -> "20 SET" */
export function formatarDataCurta(dataIso: string) {
  const [, mes, dia] = apenasData(dataIso).split("-");
  return `${dia} ${MESES_ABREVIADOS[Number(mes) - 1]}`;
}

/** "2026-09-20" -> "20 de setembro de 2026" */
export function formatarDataLonga(dataIso: string) {
  return new Date(`${apenasData(dataIso)}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** "09:00:00" -> "09:00" */
export function formatarHorario(horario: string) {
  return horario.slice(0, 5);
}

/** ("09:00:00", "17:00:00") -> "09:00 às 17:00" */
export function formatarJanelaHorario(inicio?: string | null, termino?: string | null) {
  if (!inicio || !termino) return null;
  return `${formatarHorario(inicio)} às ${formatarHorario(termino)}`;
}

/** "João Expositor" -> "JE" */
export function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

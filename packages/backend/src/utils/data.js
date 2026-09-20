const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** "2026-06-23" -> "23 de junho de 2026" (aceita string ou Date, defensivo contra o driver do banco). */
export function formatarDataLongaPtBr(dataIso) {
  const dataString = dataIso instanceof Date ? dataIso.toISOString().slice(0, 10) : String(dataIso).slice(0, 10);
  const [ano, mes, dia] = dataString.split('-');
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${ano}`;
}

// Sem O, I, 0, 1 -- evita confusão na hora de ler o código em voz alta na portaria.
const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function gerarCodigoCheckin(tamanho = 6) {
  let codigo = '';
  for (let i = 0; i < tamanho; i++) {
    codigo += CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
  }
  return codigo;
}

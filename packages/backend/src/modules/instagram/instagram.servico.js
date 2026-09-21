/**
 * Feed social exibido na Home — 100% mockado, sem integração com nenhuma API
 * externa. As publicações abaixo são fixas: texto genérico e imagens de um
 * serviço de placeholder (picsum.photos), só para o layout do feed não ficar
 * vazio.
 */
const PUBLICACOES_DEMONSTRACAO = [
  {
    id: 'demo-1',
    legenda: 'Domingo de sol e motor ligado — bora pro próximo encontro!',
    tipo: 'IMAGE',
    imagemUrl: 'https://imgur.com/brMt9nM.png',
    link: 'https://www.instagram.com/p/DcgfFuZgbis/?utm_source=ig_web_button_share_sheet&igsi=MzRlODBiNWFlZA==',
    publicadoEm: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    legenda: 'Aquele Opala ficou show na última edição.',
    tipo: 'IMAGE',
    imagemUrl: 'https://imgur.com/Jtjcsoj.png',
    link: 'https://www.instagram.com/p/DbBNYZ_kf-T/?utm_source=ig_web_button_share_sheet&igsi=MzRlODBiNWFlZA==',
    publicadoEm: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'demo-3',
    legenda: 'Bastidores da organização do próximo encontro em Joinville.',
    tipo: 'IMAGE',
    imagemUrl: 'https://imgur.com/YY0oKgc.png',
    link: 'https://www.instagram.com/p/DY5sk6pEart/?utm_source=ig_web_button_share_sheet&igsi=MzRlODBiNWFlZA==',
    publicadoEm: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'demo-4',
    legenda: 'Clássicos de todas as décadas, um clube só.',
    tipo: 'IMAGE',
    imagemUrl: 'https://imgur.com/wtDC4vQ.png',
    link: 'https://www.instagram.com/p/DWg3abukWZD/?utm_source=ig_web_button_share_sheet&igsi=MzRlODBiNWFlZA==',
    publicadoEm: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

/**
 * Devolve as publicações mockadas do feed. O campo `demonstracao` é mantido
 * no retorno (sempre `true`) só para não quebrar o contrato já consumido
 * pelo frontend — `SocialFeed` usa esse campo para mostrar o selo "Prévia".
 */
export function buscarPublicacoesRecentes(limite = 8) {
  return { publicacoes: PUBLICACOES_DEMONSTRACAO.slice(0, limite), demonstracao: true };
}

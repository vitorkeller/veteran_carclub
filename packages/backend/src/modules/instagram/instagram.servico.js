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
    imagemUrl: 'https://instagram.fbnu9-1.fna.fbcdn.net/v/t39.30808-6/783671978_1310964082097092_6768385551707237784_n.png?_nc_cat=101&ig_cache_key=Mzk3MjMxMTU5MTcwOTQyODczNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=SqqCtmZ_NAwQ7kNvwFzDqb5&_nc_oc=Adqe5DOfcB1GEsP2LS4HxOMUL921dh17g8raCC_ei24OfDGbnksqtHVLHn6FSTmuLBTiGovwdZ5DC_O4InkhIVVo&_nc_ad=z-m&_nc_cid=6357&_nc_zt=23&_nc_ht=instagram.fbnu9-1.fna&_nc_gid=d4a1P3HBO3wfyOmoVc5Siw&_nc_ss=7a22e&oh=00_AQIasZhiFm8XmirZLZuGeb7REHB4-KKKyVzIpMZDQbd9EQ&oe=6A9D09C9',
    link: 'https://www.instagram.com/p/DcgfFuZgbis/?utm_source=ig_web_button_share_sheet&igsi=MzRlODBiNWFlZA==',
    publicadoEm: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    legenda: 'Aquele Opala ficou show na última edição.',
    tipo: 'IMAGE',
    imagemUrl: 'https://instagram.fbnu11-1.fna.fbcdn.net/v/t51.82787-15/753206213_18606592324049404_5747093427319990814_n.jpg?stp=dst-jpegr_e35_p1080x1080_tt6&_nc_cat=104&ig_cache_key=Mzk0NTQ5MjAzNjEzMTk0NjA3Nw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMzEwMy5oZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Jg3X53D26zcQ7kNvwHrM_CL&_nc_oc=Adq8_lpMnZqqdaDHVf5Ld9BQvkiG9m6xXE_JmLVI82Erpa2Ng2b5nDC-D1ued_kwryi11gj6xraVhE5WnfdL7gG6&_nc_ad=z-m&_nc_cid=6357&_nc_zt=23&_nc_ht=instagram.fbnu11-1.fna&_nc_gid=L5X8iW7SMoVokvIwGGVZQQ&_nc_ss=7a22e&oh=00_AQJjZaRQ6OMKBl3bh22ATb6tS1hZwmx9NjChR0imtrGRIw&oe=6A9D208E',
    link: 'https://www.instagram.com/p/DbBNYZ_kf-T/?utm_source=ig_web_button_share_sheet&igsi=MzRlODBiNWFlZA==',
    publicadoEm: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'demo-3',
    legenda: 'Bastidores da organização do próximo encontro em Joinville.',
    tipo: 'IMAGE',
    imagemUrl: 'https://instagram.fbnu11-1.fna.fbcdn.net/v/t51.82787-15/709365890_18590530147049404_3572870944560608932_n.jpg?stp=dst-jpegr_e35_p1080x1080_tt6&_nc_cat=100&ig_cache_key=MzkwNzM1MDEwOTY4MzY5NjQwNQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMzAyNC5oZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=qkcEi9oq4gAQ7kNvwGhAthS&_nc_oc=Adp8IoS5An6KdxI4rwNT_NbnIj2gPgqWdOOFrIBK-kv38iyyPFH0Zr2mUJj9rh6gncVn1q2OxoAtIG1CJWylhWo1&_nc_ad=z-m&_nc_cid=6357&_nc_zt=23&_nc_ht=instagram.fbnu11-1.fna&_nc_gid=mEBW-eZRAV6nUogqtiqZ_g&_nc_ss=7a22e&oh=00_AQKI2pQpxmcVrHiJC5gHbrq7zR4bJiF38TrG2R3KPpUH_g&oe=6A9D170A',
    link: 'https://www.instagram.com/p/DY5sk6pEart/?utm_source=ig_web_button_share_sheet&igsi=MzRlODBiNWFlZA==',
    publicadoEm: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'demo-4',
    legenda: 'Clássicos de todas as décadas, um clube só.',
    tipo: 'IMAGE',
    imagemUrl: 'https://instagram.fbnu9-1.fna.fbcdn.net/v/t51.82787-15/658166319_18574699810049404_2384976726275307881_n.jpg?stp=dst-jpegr_e35_tt6&_nc_cat=105&ig_cache_key=Mzg2NDMzMDc0OTEzMDkwNTk1MQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5oZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=vbQ2KwuHBXkQ7kNvwGk7-BU&_nc_oc=AdosRV4awC4wnqDgD-mE2ATGnCpwHvyodzGQ5Fhmekmtb-oq31a8n6Tvcw7rAJwnDarj6HWrYDvMm5rancyghJE_&_nc_ad=z-m&_nc_cid=6357&_nc_zt=23&_nc_ht=instagram.fbnu9-1.fna&_nc_gid=zEWzUbv0_Uy35UlGMmmbhg&_nc_ss=7a22e&oh=00_AQI9fSkw-Xer2WOFCum1VZPt_K8ljBMos5XAbrjyklJo2A&oe=6A9D186F',
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

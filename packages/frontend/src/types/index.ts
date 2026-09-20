export type StatusEvento = "agendado" | "realizado" | "cancelado";

export interface ImagemGaleria {
  id: number;
  imagem_url: string;
  legenda?: string | null;
}

export interface VeiculoParticipante {
  id: number;
  nome: string;
  ano: number;
  proprietario_nome: string;
}

export interface VeiculoDestaque {
  id: number;
  nome: string;
  modelo: string;
  ano: number;
  modificacoes?: string | null;
  proprietario_nome: string;
  imagens: string[];
}

export interface HistoriaResumo {
  id: number;
  titulo: string;
  conteudo: string;
}

export interface Evento {
  id: number;
  nome: string;
  descricao?: string | null;
  data_evento: string; // ISO (AAAA-MM-DD)
  horario_inicio?: string | null; // "HH:MM:SS"
  horario_termino?: string | null;
  cidade: string;
  local?: string | null;
  capacidade_maxima: number;
  imagem_capa_url?: string | null;
  presentes?: number | null;
  status: StatusEvento;
  // Presentes apenas no detalhe de eventos passados (GET /api/eventos/:id):
  galeria?: ImagemGaleria[];
  veiculos_participantes?: VeiculoParticipante[];
  historia?: HistoriaResumo | null;
  veiculos_destaque?: VeiculoDestaque[];
}

export interface Historia {
  id: number;
  titulo: string;
  conteudo: string;
  imagem_url?: string | null;
  destaque: boolean;
  autor_nome?: string | null;
  usuario_id?: number | null;
  evento_id: number | null;
  evento_nome?: string | null;
  evento_data?: string | null;
  evento_local?: string | null;
  evento_imagem_capa_url?: string | null;
  veiculos_destaque_ids?: number[];
  criado_em?: string;
}

export interface VeiculoAcervo {
  id: number;
  nome: string;
  modelo: string;
  ano: number;
  modificacoes?: string | null;
  publicado_acervo?: boolean;
  imagens: string[];
  proprietario_nome: string;
  proprietario_instagram?: string | null;
  eventos: string[];
}

/** Imagem com ID -- só na listagem do admin, que precisa excluir uma foto específica. */
export interface VeiculoImagemAdmin {
  id: number;
  url: string;
}

export interface VeiculoAdmin extends Omit<VeiculoAcervo, "imagens"> {
  imagens: VeiculoImagemAdmin[];
}

export type TipoUsuario = "visitante" | "expositor" | "admin";
export type StatusUsuario = "pendente" | "aprovado" | "rejeitado";

export interface Usuario {
  id: number;
  nome_completo: string;
  email: string;
  instagram?: string | null;
  tipo: TipoUsuario;
  status: StatusUsuario;
  criado_em: string;
}

export interface AgendaEventos {
  proximos: Evento[];
  passados: Evento[];
}

export interface PublicacaoInstagram {
  id: string;
  legenda: string;
  tipo: string;
  imagemUrl: string;
  link: string;
  publicadoEm: string;
}

export interface MensagemContato {
  id: number;
  nome: string;
  email: string;
  mensagem: string;
  lida: boolean;
  criado_em: string;
}

/** Uma linha inscrita em um evento (visitante ou expositor), para o Dashboard de Inscritos do admin. */
export interface Inscrito {
  inscricao_id: number;
  tipo: TipoUsuario;
  criado_em: string;
  checkin_em?: string | null;
  codigo_checkin?: string | null;
  usuario_id: number;
  nome_completo: string;
  email: string;
  usuario_status: StatusUsuario;
  veiculo_id: number | null;
  veiculo_nome: string | null;
  veiculo_modelo: string | null;
  veiculo_ano: number | null;
  veiculo_modificacoes?: string | null;
  veiculo_documento_url?: string | null;
  veiculo_imagens?: string[];
}

/** Resultado de um check-in bem-sucedido na portaria. */
export interface CheckinResultado {
  nomeCompleto: string;
  tipo: TipoUsuario;
  veiculoNome: string | null;
  checkinEm: string;
}

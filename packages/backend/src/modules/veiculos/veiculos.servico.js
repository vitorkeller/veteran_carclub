import { z } from 'zod';
import { ErroHttp } from '../../utils/ErroHttp.js';
import * as veiculosRepo from './veiculos.repositorio.js';

const MAX_IMAGENS_VEICULO = 10;

const esquemaCadastro = z.object({
  nome: z.string().trim().min(1, 'Dê um nome/apelido para o veículo'),
  modelo: z.string().trim().min(1, 'Informe o modelo do veículo'),
  ano: z.coerce.number().int().min(1885).max(new Date().getFullYear() + 1),
  documentoUrl: z.string().trim().url().optional(),
  modificacoes: z.string().trim().optional(),
  imagens: z.array(z.string().trim().url()).max(MAX_IMAGENS_VEICULO, `No máximo ${MAX_IMAGENS_VEICULO} imagens por veículo`).optional(),
});

/** Usuário autenticado (expositor) cadastra um veículo adicional ao seu já criado no registro. */
export async function cadastrar(usuarioId, payload) {
  const { imagens, ...dadosVeiculo } = esquemaCadastro.parse(payload);
  const veiculo = await veiculosRepo.inserir({ usuarioId, ...dadosVeiculo });
  if (imagens?.length) await veiculosRepo.inserirImagens(veiculo.id, imagens);
  return veiculo;
}

/** Página pública de Acervo: só os veículos aprovados pelo admin (curadoria). */
export async function listarAcervo() {
  return veiculosRepo.listarAcervo();
}

/** Admin: todos os veículos, publicados ou não, para a tela de curadoria. */
export async function listarTodosAdmin() {
  return veiculosRepo.listarTodosAdmin();
}

export async function buscarPorId(id) {
  return veiculosRepo.buscarPorId(id);
}

/** Detalhe público (modal do Acervo): 404 se não existir ou não estiver publicado. */
export async function buscarAcervoPorId(id) {
  const veiculo = await veiculosRepo.buscarAcervoPorId(id);
  if (!veiculo) throw new ErroHttp(404, 'Veículo não encontrado no acervo');
  return veiculo;
}

const esquemaAtualizacao = esquemaCadastro.omit({ imagens: true }).partial();

/** Admin: corrige/edita a ficha de qualquer veículo do acervo. */
export async function atualizar(id, payload) {
  const dados = esquemaAtualizacao.parse(payload);
  const veiculo = await veiculosRepo.atualizar(id, dados);
  if (!veiculo) throw new ErroHttp(404, 'Veículo não encontrado');
  return veiculo;
}

/** Admin: decide se um veículo aparece na vitrine pública do Acervo. */
export async function definirPublicadoAcervo(id, publicado) {
  const veiculo = await veiculosRepo.atualizar(id, { publicadoAcervo: Boolean(publicado) });
  if (!veiculo) throw new ErroHttp(404, 'Veículo não encontrado');
  return veiculo;
}

/** Admin: remove um veículo do acervo (ex.: cadastro duplicado ou incorreto). */
export async function excluir(id) {
  const excluiu = await veiculosRepo.excluir(id);
  if (!excluiu) throw new ErroHttp(404, 'Veículo não encontrado');
}

/** Admin: adiciona novas fotos a um veículo já cadastrado (limite de 10 no total). */
export async function adicionarImagens(veiculoId, urls) {
  const veiculo = await veiculosRepo.buscarPorId(veiculoId);
  if (!veiculo) throw new ErroHttp(404, 'Veículo não encontrado');
  if (!Array.isArray(urls) || urls.length === 0) throw new ErroHttp(400, 'Nenhuma imagem informada');

  const atuais = await veiculosRepo.contarImagens(veiculoId);
  if (atuais + urls.length > MAX_IMAGENS_VEICULO) {
    throw new ErroHttp(400, `Este veículo já tem ${atuais} imagens; o limite é ${MAX_IMAGENS_VEICULO}.`);
  }

  return veiculosRepo.inserirImagens(veiculoId, urls);
}

/** Admin: remove uma foto específica de um veículo. */
export async function removerImagem(imagemId) {
  const removeu = await veiculosRepo.excluirImagem(imagemId);
  if (!removeu) throw new ErroHttp(404, 'Imagem não encontrada');
}

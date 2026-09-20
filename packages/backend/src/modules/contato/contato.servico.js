import { z } from 'zod';
import { ErroHttp } from '../../utils/ErroHttp.js';
import * as contatoRepo from './contato.repositorio.js';

const esquemaEnvio = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  mensagem: z.string().trim().min(5, 'Escreva uma mensagem um pouco mais longa'),
});

/** Formulário de contato da Home (público). */
export async function enviar(payload) {
  const dados = esquemaEnvio.parse(payload);
  return contatoRepo.inserir(dados);
}

/** Admin: vê as mensagens recebidas. */
export async function listarTodas() {
  return contatoRepo.listarTodos();
}

export async function marcarLida(id) {
  const contato = await contatoRepo.marcarLida(id);
  if (!contato) throw new ErroHttp(404, 'Mensagem não encontrada');
  return contato;
}

export async function excluir(id) {
  const excluiu = await contatoRepo.excluir(id);
  if (!excluiu) throw new ErroHttp(404, 'Mensagem não encontrada');
}

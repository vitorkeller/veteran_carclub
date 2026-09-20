import { Router } from 'express';
import * as servico from './veiculos.servico.js';
import { autenticar, exigirAprovado, exigirAdmin } from '../../middlewares/autenticacao.js';

export const veiculosRotas = Router();

// Admin: todos os veículos (publicados ou não), para a tela de curadoria.
// Precisa vir ANTES de "/:id" (rota literal casa primeiro que o parâmetro).
veiculosRotas.get('/painel', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.listarTodosAdmin());
  } catch (erro) {
    next(erro);
  }
});

// Público — alimenta a página de Acervo (só veículos aprovados na curadoria).
veiculosRotas.get('/', async (req, res, next) => {
  try {
    res.json(await servico.listarAcervo());
  } catch (erro) {
    next(erro);
  }
});

// Público — detalhe usado no modal do Acervo (404 se não publicado).
veiculosRotas.get('/:id', async (req, res, next) => {
  try {
    res.json(await servico.buscarAcervoPorId(Number(req.params.id)));
  } catch (erro) {
    next(erro);
  }
});

// Expositor aprovado cadastra um veículo além do informado no registro.
veiculosRotas.post('/', autenticar, exigirAprovado, async (req, res, next) => {
  try {
    res.status(201).json(await servico.cadastrar(req.usuario.id, req.body));
  } catch (erro) {
    next(erro);
  }
});

// --- Admin: manutenção e curadoria do acervo ---

veiculosRotas.patch('/:id/acervo', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.definirPublicadoAcervo(Number(req.params.id), req.body.publicado));
  } catch (erro) {
    next(erro);
  }
});

veiculosRotas.put('/:id', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.atualizar(Number(req.params.id), req.body));
  } catch (erro) {
    next(erro);
  }
});

veiculosRotas.delete('/:id', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    await servico.excluir(Number(req.params.id));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

veiculosRotas.post('/:id/imagens', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await servico.adicionarImagens(Number(req.params.id), req.body.urls));
  } catch (erro) {
    next(erro);
  }
});

veiculosRotas.delete('/:id/imagens/:imagemId', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    await servico.removerImagem(Number(req.params.imagemId));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

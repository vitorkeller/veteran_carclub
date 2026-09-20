import { Router } from 'express';
import * as servico from './historias.servico.js';
import { autenticar, exigirAdmin } from '../../middlewares/autenticacao.js';

export const historiasRotas = Router();

// GET /api/historias             -> todas (página pública de Histórias)
// GET /api/historias?destaque=1  -> só destaques (Home)
historiasRotas.get('/', async (req, res, next) => {
  try {
    if (req.query.destaque) return res.json(await servico.listarDestaque());
    res.json(await servico.listarTodas());
  } catch (erro) {
    next(erro);
  }
});

historiasRotas.get('/:id', async (req, res, next) => {
  try {
    res.json(await servico.buscarPorId(Number(req.params.id)));
  } catch (erro) {
    next(erro);
  }
});

historiasRotas.post('/', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await servico.criar(req.body));
  } catch (erro) {
    next(erro);
  }
});

historiasRotas.put('/:id', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.atualizar(Number(req.params.id), req.body));
  } catch (erro) {
    next(erro);
  }
});

historiasRotas.delete('/:id', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    await servico.excluir(Number(req.params.id));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

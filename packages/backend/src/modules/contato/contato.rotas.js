import { Router } from 'express';
import * as servico from './contato.servico.js';
import { autenticar, exigirAdmin } from '../../middlewares/autenticacao.js';

export const contatoRotas = Router();

contatoRotas.post('/', async (req, res, next) => {
  try {
    await servico.enviar(req.body);
    res.status(201).json({ ok: true });
  } catch (erro) {
    next(erro);
  }
});

contatoRotas.get('/', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.listarTodas());
  } catch (erro) {
    next(erro);
  }
});

contatoRotas.patch('/:id/lida', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.marcarLida(Number(req.params.id)));
  } catch (erro) {
    next(erro);
  }
});

contatoRotas.delete('/:id', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    await servico.excluir(Number(req.params.id));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

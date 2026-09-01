import { Router } from 'express';
import * as servico from './eventos.servico.js';
import { autenticar, exigirAdmin } from '../../middlewares/autenticacao.js';

export const eventosRotas = Router();

// GET /api/eventos              -> { proximos, passados }  (Agenda de Eventos)
// GET /api/eventos?destaque=1   -> array com até 3 próximos (Home)
eventosRotas.get('/', async (req, res, next) => {
  try {
    if (req.query.destaque) return res.json(await servico.listarDestaque());
    res.json(await servico.listarAgenda());
  } catch (erro) {
    next(erro);
  }
});

eventosRotas.get('/:id', async (req, res, next) => {
  try {
    res.json(await servico.buscarPorId(Number(req.params.id)));
  } catch (erro) {
    next(erro);
  }
});

eventosRotas.post('/', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await servico.criar(req.body));
  } catch (erro) {
    next(erro);
  }
});

eventosRotas.put('/:id', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.atualizar(Number(req.params.id), req.body));
  } catch (erro) {
    next(erro);
  }
});

eventosRotas.delete('/:id', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    await servico.excluir(Number(req.params.id));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

// --- Galeria do evento (até 50 imagens, eventos passados) ---

eventosRotas.post('/:id/galeria', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await servico.adicionarImagensGaleria(Number(req.params.id), req.body.urls));
  } catch (erro) {
    next(erro);
  }
});

eventosRotas.delete('/:id/galeria/:imagemId', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    await servico.removerImagemGaleria(Number(req.params.imagemId));
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

// Admin: veículos inscritos como expositores neste evento (para a curadoria
// de "veículos em destaque" na tela de Histórias).
eventosRotas.get('/:id/participantes', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.listarParticipantes(Number(req.params.id)));
  } catch (erro) {
    next(erro);
  }
});

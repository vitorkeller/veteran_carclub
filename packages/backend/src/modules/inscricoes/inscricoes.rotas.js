import { Router } from 'express';
import * as servico from './inscricoes.servico.js';
import { autenticar, exigirAprovado, exigirAdmin } from '../../middlewares/autenticacao.js';

export const inscricoesRotas = Router();

inscricoesRotas.use(autenticar, exigirAprovado);

inscricoesRotas.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await servico.inscrever(req.usuario, req.body));
  } catch (erro) {
    next(erro);
  }
});

inscricoesRotas.get('/minhas', async (req, res, next) => {
  try {
    res.json(await servico.listarMinhas(req.usuario.id));
  } catch (erro) {
    next(erro);
  }
});

// Admin: Dashboard de Inscritos — quem se inscreveu em cada evento.
// `exigirAprovado` já deixou passar (admin sempre passa), aqui restringimos
// especificamente a admins (um visitante/expositor aprovado não pode ver a
// lista de inscritos de outras pessoas).
inscricoesRotas.get('/evento/:eventoId', exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.listarPorEvento(Number(req.params.eventoId)));
  } catch (erro) {
    next(erro);
  }
});

// Admin: check-in na portaria (digita o código apresentado pela pessoa).
inscricoesRotas.post('/evento/:eventoId/checkin', exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.fazerCheckin(Number(req.params.eventoId), req.body));
  } catch (erro) {
    next(erro);
  }
});

import { Router } from 'express';
import * as servico from './usuarios.servico.js';
import { autenticar, exigirAdmin } from '../../middlewares/autenticacao.js';

export const usuariosRotas = Router();

// Fluxo 1 (visitante) e Fluxo 2 (expositor) caem na mesma rota;
// o campo `tipo` no corpo decide qual esquema de validação se aplica.
usuariosRotas.post('/registrar', async (req, res, next) => {
  try {
    const usuario = await servico.registrar(req.body);
    res.status(201).json(usuario);
  } catch (erro) {
    next(erro);
  }
});

usuariosRotas.post('/login', async (req, res, next) => {
  try {
    res.json(await servico.login(req.body));
  } catch (erro) {
    next(erro);
  }
});

// --- Área administrativa: aprovação de cadastros ---

usuariosRotas.get('/pendentes', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.listarPendentes());
  } catch (erro) {
    next(erro);
  }
});

usuariosRotas.patch('/:id/status', autenticar, exigirAdmin, async (req, res, next) => {
  try {
    res.json(await servico.definirStatus(Number(req.params.id), req.body.status));
  } catch (erro) {
    next(erro);
  }
});

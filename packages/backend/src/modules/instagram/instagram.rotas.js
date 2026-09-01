import { Router } from 'express';
import * as servico from './instagram.servico.js';

export const instagramRotas = Router();

instagramRotas.get('/', async (req, res, next) => {
  try {
    res.json(await servico.buscarPublicacoesRecentes());
  } catch (erro) {
    next(erro);
  }
});

import express from 'express';
import * as veiculos from './veiculos.js';

export function criarApp() {
  const app = express();
  app.use(express.json());

  // Verificação de saúde: prova que a API sobe.
  app.get('/api/saude', (req, res) => res.json({ ok: true }));

  app.get('/api/veiculos', async (req, res) => {
    try {
      res.json(await veiculos.listar());
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  app.post('/api/veiculos', async (req, res) => {
    try {
      res.status(201).json(await veiculos.cadastrar(req.body));
    } catch (erro) {
      res.status(400).json({ erro: erro.message });
    }
  });

  return app;
}

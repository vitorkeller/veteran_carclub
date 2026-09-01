import express from 'express';
import cors from 'cors';
import { usuariosRotas } from './modules/usuarios/usuarios.rotas.js';
import { eventosRotas } from './modules/eventos/eventos.rotas.js';
import { veiculosRotas } from './modules/veiculos/veiculos.rotas.js';
import { inscricoesRotas } from './modules/inscricoes/inscricoes.rotas.js';
import { historiasRotas } from './modules/historias/historias.rotas.js';
import { uploadsRotas } from './modules/uploads/uploads.rotas.js';
import { contatoRotas } from './modules/contato/contato.rotas.js';
import { instagramRotas } from './modules/instagram/instagram.rotas.js';
import { tratarErros } from './middlewares/tratarErros.js';
import { PASTA_UPLOADS_LOCAL } from './services/armazenamento.js';

export function criarApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Verificação de saúde: prova que a API sobe.
  app.get('/api/saude', (req, res) => res.json({ ok: true }));

  // Serve os arquivos enviados via /api/uploads (imagens, documentos) em
  // /uploads/<arquivo> -- estático, sem autenticação (mesmo esquema de um
  // CDN público de imagens; nada sensível fica nesses arquivos).
  app.use('/uploads', express.static(PASTA_UPLOADS_LOCAL));

  app.use('/api/usuarios', usuariosRotas);
  app.use('/api/eventos', eventosRotas);
  app.use('/api/veiculos', veiculosRotas);
  app.use('/api/inscricoes', inscricoesRotas);
  app.use('/api/historias', historiasRotas);
  app.use('/api/uploads', uploadsRotas);
  app.use('/api/contato', contatoRotas);
  app.use('/api/instagram', instagramRotas);

  // Rota desconhecida -> 404 padronizado (em vez do HTML default do Express).
  app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

  // Precisa ser o último `app.use`: é o handler de erro central do Express.
  app.use(tratarErros);

  return app;
}

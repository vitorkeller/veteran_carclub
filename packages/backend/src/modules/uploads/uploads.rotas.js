import { Router } from 'express';
import { upload } from '../../middlewares/upload.js';
import { salvarArquivo } from '../../services/armazenamento.js';
import { ErroHttp } from '../../utils/ErroHttp.js';

export const uploadsRotas = Router();

/**
 * POST /api/uploads (multipart/form-data, campo "arquivos", até 50 arquivos)
 * -> { urls: string[] }
 *
 * Pública de propósito: o cadastro de expositor precisa enviar o documento
 * do carro e as fotos do veículo *antes* de existir uma conta (é exatamente
 * esse envio que cria a conta). Ainda assim, os limites de tamanho/tipo do
 * multer (ver middlewares/upload.js) reduzem o risco de abuso. Para
 * produção, vale reforçar com rate limiting/captcha.
 * 
 * Cada arquivo é salvo em disco local (packages/backend/uploads/) — ver
 * services/armazenamento.js.
 */
uploadsRotas.post('/', upload.array('arquivos', 50), async (req, res, next) => {
  try {
    const arquivos = req.files;
    if (!arquivos || arquivos.length === 0) {
      throw new ErroHttp(400, 'Nenhum arquivo enviado');
    }
    const urls = await Promise.all(
      arquivos.map((arquivo) => salvarArquivo(arquivo.buffer, arquivo.originalname, arquivo.mimetype))
    );
    res.status(201).json({ urls });
  } catch (erro) {
    next(erro);
  }
});

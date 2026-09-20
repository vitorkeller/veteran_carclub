import multer from 'multer';

const TIPOS_AUTORIZADOS = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf', // documento do veículo pode ser um PDF
]);

function filtrarTipo(req, file, callback) {
  if (!TIPOS_AUTORIZADOS.has(file.mimetype)) {
    return callback(new Error('Tipo de arquivo não permitido. Envie apenas imagens (jpg, png, webp, gif) ou PDF.'));
  }
  callback(null, true);
}

/**
 * Guarda o arquivo em memória (buffer), não em disco: quem grava o arquivo
 * de fato é `services/armazenamento.js`, chamado depois que o multer
 * termina de processar o upload.
 *
 * Aceita até 50 arquivos por requisição (o teto real de uso é a galeria de
 * eventos passados); cada endpoint valida o limite específico dele
 * (10 para veículo, 1 para capa de evento, etc.) na camada de serviço.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: filtrarTipo,
  limits: { fileSize: 5 * 1024 * 1024, files: 50 }, // 5MB por arquivo
});

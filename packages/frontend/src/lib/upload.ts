import { API_URL } from "./api";

export class ErroUpload extends Error {}

/** Envia um ou mais arquivos para o backend e devolve as URLs públicas resultantes. */
export async function enviarArquivos(arquivos: File[]): Promise<string[]> {
  if (arquivos.length === 0) return [];

  const formData = new FormData();
  arquivos.forEach((arquivo) => formData.append("arquivos", arquivo));

  const resposta = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    body: formData,
  });

  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new ErroUpload(corpo.erro ?? "Não foi possível enviar o(s) arquivo(s).");
  }

  // O backend devolve caminhos relativos ("/uploads/arquivo.jpg"); como o
  // frontend e o backend rodam em origens diferentes em dev, prefixamos com
  // a URL da API para o navegador conseguir carregar a imagem.
  return corpo.urls.map((caminho: string) => `${API_URL}${caminho}`);
}

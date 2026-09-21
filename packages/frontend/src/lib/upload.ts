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

  // O backend agora sempre devolve URLs absolutas do Supabase Storage —
  // nada para prefixar aqui.
  return corpo.urls as string[];
}

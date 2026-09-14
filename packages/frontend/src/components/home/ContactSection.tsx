"use client";

import { useState, type FormEvent } from "react";
import { API_URL } from "@/lib/api";

const EMAIL_CONTATO = "contato@veterancarclub.com.br";

export function ContactSection() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    async function enviar(evento: FormEvent) {
        evento.preventDefault();

        if (!nome.trim() || !email.trim() || !mensagem.trim()) {
            setErro("Preencha nome, e-mail e mensagem antes de enviar.");
            return;
        }
        setErro("");
        setEnviando(true);

        try {
            const resposta = await fetch(`${API_URL}/api/contato`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, mensagem }),
            });
            if (!resposta.ok) {
                const corpo = await resposta.json().catch(() => ({}));
                throw new Error(
                    corpo.erro ?? "Não foi possível enviar sua mensagem.",
                );
            }
            setEnviado(true);
            setNome("");
            setEmail("");
            setMensagem("");
        } catch (e) {
            setErro(
                e instanceof Error
                    ? e.message
                    : "Não foi possível enviar sua mensagem.",
            );
        } finally {
            setEnviando(false);
        }
    }

    return (
        <section
            id="contato"
            className="bg-azul-marinho px-6 py-20 text-branco"
        >
            <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
                <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-azul-claro">
                        Contato
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-semibold">
                        Fale com o clube
                    </h2>
                    <p className="mt-4 max-w-md text-azul-claro/90">
                        Dúvidas sobre os encontros, parcerias ou quer levar seu
                        carro para a próxima edição? Manda uma mensagem.
                    </p>

                    <dl className="mt-8 space-y-3 text-sm">
                        <div className="flex gap-2">
                            <dt className="font-semibold text-azul-claro">
                                E-mail
                            </dt>
                            <dd>{EMAIL_CONTATO}</dd>
                        </div>
                        <div className="flex gap-2">
                            <dt className="font-semibold text-azul-claro">
                                Local
                            </dt>
                            <dd>Joinville, SC</dd>
                        </div>
                        <div className="flex gap-2">
                            <dt className="font-semibold text-azul-claro">
                                Instagram
                            </dt>
                            <dd>@veterancarjoinville</dd>
                        </div>
                    </dl>
                </div>

                {enviado ? (
                    <div className="flex flex-col items-start justify-center gap-3 rounded-md border border-azul-claro/30 bg-branco/5 p-6">
                        <p className="font-display text-lg font-semibold">
                            Mensagem enviada!
                        </p>
                        <p className="text-sm text-azul-claro/90">
                            Obrigado por entrar em contato. O clube vai
                            responder no e-mail informado.
                        </p>
                        <button
                            type="button"
                            onClick={() => setEnviado(false)}
                            className="text-sm font-semibold text-azul-claro hover:underline"
                        >
                            Enviar outra mensagem
                        </button>
                    </div>
                ) : (
                    <form onSubmit={enviar} className="flex flex-col gap-4">
                        <div>
                            <label
                                htmlFor="contato-nome"
                                className="mb-1 block text-sm font-medium text-azul-claro"
                            >
                                Nome
                            </label>
                            <input
                                id="contato-nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full rounded-md border border-azul-claro/30 bg-branco/5 px-4 py-2 text-branco placeholder:text-azul-claro/50 focus:border-azul-claro focus:outline-none"
                                placeholder="Seu nome"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="contato-email"
                                className="mb-1 block text-sm font-medium text-azul-claro"
                            >
                                E-mail
                            </label>
                            <input
                                id="contato-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-md border border-azul-claro/30 bg-branco/5 px-4 py-2 text-branco placeholder:text-azul-claro/50 focus:border-azul-claro focus:outline-none"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="contato-mensagem"
                                className="mb-1 block text-sm font-medium text-azul-claro"
                            >
                                Mensagem
                            </label>
                            <textarea
                                id="contato-mensagem"
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-azul-claro/30 bg-branco/5 px-4 py-2 text-branco placeholder:text-azul-claro/50 focus:border-azul-claro focus:outline-none"
                                placeholder="Como podemos ajudar?"
                            />
                        </div>

                        {erro && <p className="text-sm text-red-300">{erro}</p>}

                        <button
                            type="submit"
                            disabled={enviando}
                            className="rounded-md bg-azul-claro px-6 py-3 text-sm font-semibold text-azul-marinho transition-colors hover:bg-branco disabled:opacity-60"
                        >
                            {enviando ? "Enviando..." : "Enviar mensagem"}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}

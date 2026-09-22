/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLoginPage from '@/app/admin/login/page';
import { limparSessao, obterSessao } from '@/lib/admin-auth';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('AdminLoginPage', () => {
  beforeEach(() => {
    push.mockClear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    limparSessao(); // evita vazar sessão de um teste pro outro (admin-auth guarda cache em memória)
    vi.unstubAllGlobals();
  });

  it('faz login com sucesso, guarda a sessão e redireciona pro painel', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'token-fake',
        usuario: { id: 1, nome_completo: 'Admin', email: 'admin@teste.com', tipo: 'admin', status: 'aprovado' },
      }),
    });

    render(<AdminLoginPage />);
    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@teste.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin'));
    expect(obterSessao()?.token).toBe('token-fake');
  });

  it('mostra a mensagem de erro que a API devolve quando a senha está errada', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ erro: 'E-mail ou senha inválidos' }),
    });

    render(<AdminLoginPage />);
    await userEvent.type(screen.getByLabelText('E-mail'), 'admin@teste.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-errada');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('E-mail ou senha inválidos')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('recusa quem não é admin mesmo com credenciais corretas (regra fica no próprio componente)', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'token-fake',
        usuario: { id: 2, nome_completo: 'Visitante', email: 'visitante@teste.com', tipo: 'visitante', status: 'aprovado' },
      }),
    });

    render(<AdminLoginPage />);
    await userEvent.type(screen.getByLabelText('E-mail'), 'visitante@teste.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha-123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/restrito a administradores/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

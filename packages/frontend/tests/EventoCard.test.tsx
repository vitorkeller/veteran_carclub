import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventoCard } from '@/components/eventos/EventoCard';
import type { Evento } from '@/types';

const eventoBase: Evento = {
  id: 1,
  nome: 'Encontro de Primavera',
  descricao: 'Edição especial de aniversário do clube.',
  data_evento: '2026-10-15',
  horario_inicio: '09:00:00',
  horario_termino: '13:00:00',
  cidade: 'Joinville',
  local: 'Praça Central',
  capacidade_maxima: 300,
  imagem_capa_url: null,
  status: 'agendado',
};

describe('EventoCard', () => {
  it('mostra nome, data e local do evento', () => {
    render(<EventoCard evento={eventoBase} />);

    expect(screen.getByText('Encontro de Primavera')).toBeInTheDocument();
    expect(screen.getByText('Praça Central')).toBeInTheDocument();
    expect(screen.getByText(/15 de outubro de 2026/)).toBeInTheDocument();
  });

  it('mostra o link de inscrição na variante "proximo"', () => {
    render(<EventoCard evento={eventoBase} variante="proximo" />);
    expect(screen.getByRole('link', { name: /inscreva-se/i })).toHaveAttribute('href', '/inscricao?evento=1');
  });

  it('mostra o selo "Realizado" na variante "passado" e esconde o link de inscrição', () => {
    render(<EventoCard evento={eventoBase} variante="passado" />);
    expect(screen.getByText('Realizado')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /inscreva-se/i })).not.toBeInTheDocument();
  });
});

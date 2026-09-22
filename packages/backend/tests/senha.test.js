import { describe, it, expect } from 'vitest';
import { gerarHash, conferir } from '../src/utils/senha.js';

describe('utils/senha', () => {
  it('gera um hash que confere com a senha original', async () => {
    const hash = await gerarHash('minha-senha-123');
    expect(await conferir('minha-senha-123', hash)).toBe(true);
  });

  it('não confere com uma senha errada', async () => {
    const hash = await gerarHash('minha-senha-123');
    expect(await conferir('outra-senha', hash)).toBe(false);
  });

  it('nunca guarda a senha em texto puro no hash', async () => {
    const hash = await gerarHash('minha-senha-123');
    expect(hash).not.toContain('minha-senha-123');
  });
});

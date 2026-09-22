import * as eventosRepo from '../src/modules/eventos/eventos.repositorio.js';
import * as usuariosRepo from '../src/modules/usuarios/usuarios.repositorio.js';
import { gerarHash } from '../src/utils/senha.js';
import { gerarToken } from '../src/utils/token.js';

function diasNoFuturo(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

/** Cria um evento futuro direto no banco (sem passar pela API) para servir de cenário nos testes. */
export async function criarEventoDeTeste(sobrescritas = {}) {
  return eventosRepo.inserir({
    nome: 'Encontro de teste',
    descricao: null,
    dataEvento: diasNoFuturo(7),
    horarioInicio: '09:00',
    horarioTermino: '13:00',
    local: 'Praça Central',
    capacidadeMaxima: 2,
    imagemCapaUrl: null,
    ...sobrescritas,
  });
}

/** Cria um admin direto no banco (mesma regra de negócio real: admin nunca se cadastra pelo site) e devolve um token válido. */
export async function criarAdminDeTeste() {
  const senha = 'senha-forte-123';
  const admin = await usuariosRepo.inserir({
    nomeCompleto: 'Admin de Teste',
    email: `admin-${Date.now()}-${Math.random().toString(36).slice(2)}@teste.com`,
    senhaHash: await gerarHash(senha),
    tipo: 'admin',
    status: 'aprovado',
  });
  return { admin, senha, token: gerarToken(admin) };
}

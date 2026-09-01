// Erro com status HTTP embutido. As camadas de serviço lançam isso
// (ex.: throw new ErroHttp(409, 'Evento lotado')) e o errorHandler central
// em app.js sabe converter automaticamente em { erro: '...' } com o status certo.
export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = 'ErroHttp';
    this.status = status;
  }
}

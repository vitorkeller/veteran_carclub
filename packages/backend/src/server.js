import { criarApp } from './app.js';
import { migrar } from './db.js';

const porta = process.env.PORT || 3001;

await migrar();
console.log('banco pronto');

criarApp().listen(porta, () => {
	console.log(`Veteran Car Club API rodando em http://localhost:${porta}. Verificação de saúde: http://localhost:${porta}/api/saude`);
});

import type { E2EData } from '../fixtures-types';
import { createEntrySeed } from '../lancamentos-fixture';

export type RouteEntities = {
	autor: number;
	aviso: number;
	colecao: number;
	editora: number;
	keyword: number;
	livro: number;
	cadastro: number;
	palestrante: number;
	emprestimo: number;
	lancamento: number;
	recibo: string;
	usuario: string;
	contaPropria: string;
};

const createReceipt = async (e2e: E2EData, contributorId: number) => {
	const lancamento = await e2e.createLancamento(createEntrySeed(e2e.token, 'catalogo', contributorId));
	if (!lancamento.uuidRecibo) throw new Error('Lançamento de teste sem recibo.');
	return { lancamento: lancamento.id, recibo: lancamento.uuidRecibo };
};

export const createRouteEntities = async (e2e: E2EData): Promise<RouteEntities> => {
	const catalog = await e2e.createBookCatalog();
	const notice = await e2e.createNotice();
	const participant = await e2e.createParticipant('catalogo');
	const loanedBook = catalog.livros.related.idlivro;
	return {
		autor: catalog.autor[0].id,
		aviso: notice.id,
		colecao: catalog.colecao[0].id,
		editora: catalog.editora[0].id,
		keyword: catalog.keyword[0].id,
		livro: catalog.livros.primary.idlivro,
		cadastro: participant.id,
		palestrante: await e2e.createSpeaker({ nome: `Palestrante catálogo ${e2e.token}` }),
		emprestimo: await e2e.createLoan(loanedBook, participant.id),
		...(await createReceipt(e2e, participant.id)),
		usuario: e2e.users.owner.id,
		contaPropria: e2e.users.fullAdmin.id,
	};
};

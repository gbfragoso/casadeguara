import { requireLibraryAccess } from '#lib/server/authorization/biblioteca.js';
import { type EmprestimoModel } from '#lib/server/models/emprestimo.js';
import { error } from '@sveltejs/kit';

type ReceiptModel = Pick<EmprestimoModel, 'findReceipt'>;
type User = { roles: string } | null;
type HandlerContext = { locals: { user: User }; params: { id: string } };

const LOAD_FAILURE_MESSAGE = 'Falha ao carregar os dados do empréstimo';

export const createBibliotecaEmprestimosIdIntegerReciboHandlers = ({ model }: { model: ReceiptModel }) => ({
	load: async ({ locals, params }: HandlerContext) => {
		requireLibraryAccess(locals.user);
		let recibo;

		try {
			recibo = await model.findReceipt(Number(params.id));
		} catch (cause) {
			console.error(LOAD_FAILURE_MESSAGE, { cause });
			error(500, LOAD_FAILURE_MESSAGE);
		}

		if (!recibo) error(404, 'Empréstimo não encontrado');

		return { recibo };
	},
});

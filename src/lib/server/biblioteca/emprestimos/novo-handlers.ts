import type { Actions, RequestEvent } from '@sveltejs/kit';

import { appendPrintRequest } from '#lib/printing/print-request.js';
import { requireLibraryAccess } from '#lib/server/authorization/biblioteca.js';
import { error, redirect } from '@sveltejs/kit';
import {
	listReaders,
	listCopies,
	rejectLoan,
	validateReader,
	recordLoan,
} from '#lib/server/biblioteca/loans/create.js';

const load = async ({ locals }: RequestEvent) => {
	requireLibraryAccess(locals.user);

	try {
		const [leitores, exemplares] = await Promise.all([listReaders(), listCopies()]);
		return { leitores, exemplares };
	} catch (err) {
		console.error(err);
		error(500, 'Falha ao carregar os dados para empréstimo');
	}
};

const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = requireLibraryAccess(locals.user);

		const form = await request.formData();
		const readerId = Number(form.get('leitorid'));
		const copyId = Number(form.get('exemplarid'));
		if (!readerId) return rejectLoan('leitor', 'Leitor não encontrado');
		if (!copyId) return rejectLoan('exemplar', 'Exemplar não encontrado');

		const rejection = await validateReader(readerId, user.roles.includes('admin'));
		if (rejection) return rejection;

		const id = await recordLoan(readerId, copyId, user.id);
		redirect(302, appendPrintRequest(`/biblioteca/emprestimos/${id}/recibo`));
	},
};

export const createBibliotecaEmprestimosNovoHandlers = () => ({
	load,
	actions,
});

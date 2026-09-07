import type { Actions, RequestEvent } from '@sveltejs/kit';

import { error, redirect } from '@sveltejs/kit';
import { listReaders, listCopies, rejectLoan, validateReader, recordLoan } from '$lib/server/biblioteca/loans/create';

const load = async ({ locals }: RequestEvent) => {
	if (!locals.user) redirect(302, '/');

	try {
		const [leitores, exemplares] = await Promise.all([listReaders(), listCopies()]);
		return { leitores, exemplares };
	} catch (err) {
		console.error(err);
		error(500, { message: 'Falha ao carregar os dados para empréstimo' });
	}
};

const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(302, '/');

		const form = await request.formData();
		const readerId = Number(form.get('leitorid'));
		const copyId = Number(form.get('exemplarid'));
		if (!readerId) return rejectLoan('leitor', 'Leitor não encontrado');
		if (!copyId) return rejectLoan('exemplar', 'Exemplar não encontrado');

		const rejection = await validateReader(readerId, locals.user.roles.includes('admin'));
		if (rejection) return rejection;

		const id = await recordLoan(readerId, copyId, locals.user.id);
		redirect(302, `/biblioteca/emprestimos/${id}/recibo`);
	},
};

export const createBibliotecaEmprestimosNovoHandlers = () => ({
	load,
	actions,
});

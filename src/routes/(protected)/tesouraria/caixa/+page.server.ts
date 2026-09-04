import { requireTesourariaAdminAccess } from '$lib/server/authorization/tesouraria';
import { LancamentoError, lancamentoModel } from '$lib/server/tesouraria/lancamentos';
import { confirmDepositsSchema } from '$lib/validation/tesouraria/lancamentos';
import { error, fail } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

const readIds = (form: FormData) => form.getAll('entradas').map((value) => (typeof value === 'string' ? value : ''));

const mapFailure = (cause: unknown) => {
	if (cause instanceof LancamentoError && cause.code === 'VALIDATION_ERROR')
		return fail(400, { errors: { entradas: [cause.message] } });
	if (cause instanceof LancamentoError && cause.code === 'LANCAMENTO_NOT_FOUND')
		return fail(404, { message: cause.message });
	if (cause instanceof LancamentoError && cause.code === 'LANCAMENTO_NOT_DEPOSITABLE')
		return fail(409, { message: cause.message });
	console.error('treasury.launches.deposit_failed');
	error(500, { message: 'Falha ao confirmar o depósito.' });
};

export const load: PageServerLoad = async ({ locals }) => {
	requireTesourariaAdminAccess(locals.user);
	try {
		return { entradas: await lancamentoModel.listPendingDeposits() };
	} catch {
		console.error('treasury.launches.deposit_list_failed');
		error(500, { message: 'Falha ao carregar a lista de entradas.' });
	}
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const user = requireTesourariaAdminAccess(locals.user);
		const form = await request.formData();
		const values = readIds(form);
		const result = confirmDepositsSchema.safeParse({ ids: values });
		if (!result.success)
			return fail(400, {
				values: { entradas: values },
				errors: { entradas: ['Seleção de lançamentos inválida.'] },
			});
		try {
			await lancamentoModel.confirmDeposits(result.data.ids, user.id);
			console.info('treasury.launches.deposits_confirmed', { ids: result.data.ids, userId: user.id });
			return { status: 201, message: 'Depósito confirmado com sucesso.' };
		} catch (cause) {
			return mapFailure(cause);
		}
	},
} satisfies Actions;

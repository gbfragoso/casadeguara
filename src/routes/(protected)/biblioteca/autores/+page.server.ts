import { autorModel, type AutorModel } from '$lib/server/models/autor';
import { autorSearchSchema } from '$lib/validation/autor';
import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions } from './$types';

type ListAutorModel = Pick<AutorModel, 'fetch'>;
type AuthLoadArgs = { locals: { user: unknown } };
type ListActionArgs = { request: Request };

export function _createListAuthorHandlers(model: ListAutorModel) {
	const load = async ({ locals }: AuthLoadArgs) => {
		if (!locals.user) redirect(302, '/');
	};

	const actions = {
		default: async ({ request }: ListActionArgs) => {
			const formData = await request.formData();
			const nome = formData.get('nome');
			const values = { nome: typeof nome === 'string' ? nome : '' };
			const result = autorSearchSchema.safeParse({ nome });
			if (!result.success) return fail(400, { values, errors: result.error.flatten().fieldErrors });

			try {
				const autores = await model.fetch(result.data.nome);
				return { autores, values: { nome: result.data.nome } };
			} catch (exception) {
				console.error(exception);
				error(500, { message: 'Falha ao carregar a lista de autores' });
			}
		},
	} satisfies Actions;

	return { load, actions };
}

export const { load, actions } = _createListAuthorHandlers(autorModel);

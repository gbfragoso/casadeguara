import { autorModel, type AutorModel } from '$lib/server/models/autor';
import { autorSchema } from '$lib/validation/autor';
import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions } from './$types';

type CreateAutorModel = Pick<AutorModel, 'create'>;
type AuthLoadArgs = { locals: { user: unknown } };
type CreateActionArgs = { request: Request };

export function _createNewAuthorHandlers(model: CreateAutorModel) {
	const load = async ({ locals }: AuthLoadArgs) => {
		if (!locals.user) redirect(302, '/');
	};

	const actions = {
		default: async ({ request }: CreateActionArgs) => {
			const formData = await request.formData();
			const nome = formData.get('nome');
			const values = { nome: typeof nome === 'string' ? nome : '' };
			const result = autorSchema.safeParse({ nome });
			if (!result.success) return fail(400, { values, errors: result.error.flatten().fieldErrors });

			try {
				await model.create(result.data.nome);
				return { status: 201 };
			} catch (exception) {
				console.error(exception);
				error(500, { message: 'Falha ao criar um novo autor' });
			}
		},
	} satisfies Actions;

	return { load, actions };
}

export const { load, actions } = _createNewAuthorHandlers(autorModel);

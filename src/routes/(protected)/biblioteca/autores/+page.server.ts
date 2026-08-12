import { autorModel, type AutorModel } from '$lib/server/models/autor';
import { authorSearchSchema } from '$lib/validation/autor';
import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

type ListModel = Pick<AutorModel, 'fetch'>;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const _createListHandlers = (model: ListModel) => ({
	load: async ({ locals }: { locals: { user: unknown } }) => {
		if (!locals.user) redirect(302, '/');
	},
	actions: {
		default: async ({ request }: { request: Request }) => {
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = authorSearchSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: result.error.flatten().fieldErrors });

			try {
				const autores = await model.fetch(result.data.nome);

				return { autores, values: { nome: result.data.nome } };
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao carregar a lista de autores' });
			}
		},
	},
});

const handlers = _createListHandlers(autorModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

import { editoraModel, type EditoraModel } from '$lib/server/models/editora';
import { editoraSearchSchema } from '$lib/validation/editora';
import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

type ListModel = Pick<EditoraModel, 'fetch'>;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const _createListHandlers = (model: ListModel) => ({
	load: async ({ locals }: { locals: { user: unknown } }) => {
		if (!locals.user) redirect(302, '/');
	},
	actions: {
		default: async ({ request }: { request: Request }) => {
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = editoraSearchSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: result.error.flatten().fieldErrors });

			try {
				const editoras = await model.fetch(result.data.nome);

				return { editoras, values: { nome: result.data.nome } };
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao carregar a lista de editoras' });
			}
		},
	},
});

const handlers = _createListHandlers(editoraModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

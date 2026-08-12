import { autorModel, type AutorModel } from '$lib/server/models/autor';
import { authorSchema } from '$lib/validation/autor';
import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

type CreateModel = Pick<AutorModel, 'create'>;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const _createNewAuthorHandlers = (model: CreateModel) => ({
	load: async ({ locals }: { locals: { user: unknown } }) => {
		if (!locals.user) redirect(302, '/');
	},
	actions: {
		default: async ({ request }: { request: Request }) => {
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = authorSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: result.error.flatten().fieldErrors });

			try {
				await model.create(result.data.nome);

				return { status: 201 };
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao criar um novo autor' });
			}
		},
	},
});

const handlers = _createNewAuthorHandlers(autorModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

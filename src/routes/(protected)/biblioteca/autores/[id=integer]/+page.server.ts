import { autorModel, type AutorModel } from '$lib/server/models/autor';
import { authorSchema } from '$lib/validation/autor';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';

import type { Actions, PageServerLoad } from './$types';

type EditModel = Pick<AutorModel, 'get' | 'update'>;
type User = { roles: string } | null;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

const createInternalEditAuthorHandlers = (model: EditModel) => ({
	load: async ({ locals, params }: { locals: { user: User }; params: { id: string } }) => {
		requireLibraryAccess(locals.user);

		const id = Number(params.id);
		let author;

		try {
			author = await model.get(id);
		} catch (cause) {
			console.error(cause);
			error(500, { message: 'Falha ao baixar os dados do autor' });
		}

		if (!author) error(404, { message: 'Autor não encontrado.' });

		return { autor: author };
	},
	actions: {
		default: async ({
			locals,
			request,
			params,
		}: {
			locals: { user: User };
			request: Request;
			params: { id: string };
		}) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = authorSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			const id = Number(params.id);
			let updated;

			try {
				updated = await model.update(id, result.data.nome);
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao atualizar os dados do autor' });
			}

			if (!updated) error(404, { message: 'Autor não encontrado.' });

			return { status: 200 };
		},
	},
});

const handlers = createInternalEditAuthorHandlers(autorModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

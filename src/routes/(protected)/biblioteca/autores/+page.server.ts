import { autorModel, type AutorModel } from '$lib/server/models/autor';
import { authorSearchSchema } from '$lib/validation/autor';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';

import type { Actions, PageServerLoad } from './$types';

type ListModel = Pick<AutorModel, 'fetch'>;
type User = { roles: string } | null;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

const createInternalListHandlers = (model: ListModel) => ({
	load: async ({ locals }: { locals: { user: User } }) => requireLibraryAccess(locals.user),
	actions: {
		default: async ({ locals, request }: { locals: { user: User }; request: Request }) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = authorSearchSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

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

const handlers = createInternalListHandlers(autorModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

import { autorModel, type AutorModel } from '$lib/server/models/autor';
import { authorSchema } from '$lib/validation/autor';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';

import type { Actions, PageServerLoad } from './$types';

type CreateModel = Pick<AutorModel, 'create'>;
type User = { roles: string } | null;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

const createInternalNewAuthorHandlers = (model: CreateModel) => ({
	load: async ({ locals }: { locals: { user: User } }) => requireLibraryAccess(locals.user),
	actions: {
		default: async ({ locals, request }: { locals: { user: User }; request: Request }) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = authorSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

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

const handlers = createInternalNewAuthorHandlers(autorModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

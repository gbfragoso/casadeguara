import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { colecaoModel, type ColecaoModel } from '$lib/server/models/colecao';
import { colecaoSchema } from '$lib/validation/colecao';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import type { Actions, PageServerLoad } from './$types';

type CreateModel = Pick<ColecaoModel, 'create'>;
type User = { roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const _createNewColecaoHandlers = (model: CreateModel) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => {
		requireLibraryAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = colecaoSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			try {
				await model.create(result.data.nome);

				return { status: 201 };
			} catch (cause) {
				console.error('Falha ao criar uma nova coleção', cause);
				error(500, { message: 'Falha ao criar uma nova coleção' });
			}
		},
	},
});

const handlers = _createNewColecaoHandlers(colecaoModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

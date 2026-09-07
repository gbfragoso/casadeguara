import { authorSchema } from '$lib/validation/autor';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import type { AutorModel } from '$lib/server/models/autor';

type CreateModel = Pick<AutorModel, 'create'>;
type User = { roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const createAuthorCreateHandlers = ({ model }: { model: CreateModel }) => ({
	load: async ({ locals }: Pick<ActionContext, 'locals'>) => requireLibraryAccess(locals.user),
	actions: {
		default: async ({ locals, request }: ActionContext) => {
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

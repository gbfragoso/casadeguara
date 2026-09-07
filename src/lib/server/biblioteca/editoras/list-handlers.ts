import { type EditoraModel } from '$lib/server/models/editora';
import { editoraSearchSchema } from '$lib/validation/editora';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';

type ListModel = Pick<EditoraModel, 'fetch'>;
type User = { roles: string } | null;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const createPublisherListHandlers = ({ model }: { model: ListModel }) => ({
	load: async ({ locals }: { locals: { user: User } }) => requireLibraryAccess(locals.user),
	actions: {
		default: async ({ locals, request }: { locals: { user: User }; request: Request }) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = editoraSearchSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

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

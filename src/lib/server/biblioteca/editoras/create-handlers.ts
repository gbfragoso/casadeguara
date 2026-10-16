import { type EditoraModel } from '#lib/server/models/editora.js';
import { editoraSchema } from '#lib/validation/editora.js';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireLibraryAccess } from '#lib/server/authorization/biblioteca.js';

type CreateModel = Pick<EditoraModel, 'create'>;
type User = { roles: string } | null;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const createPublisherCreateHandlers = ({ model }: { model: CreateModel }) => ({
	actions: {
		default: async ({ locals, request }: { locals: { user: User }; request: Request }) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = editoraSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			try {
				await model.create(result.data.nome);

				return { status: 201 };
			} catch (cause) {
				console.error(cause);
				error(500, 'Falha ao criar uma nova editora');
			}
		},
	},
});

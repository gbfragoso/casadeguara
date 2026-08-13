import { editoraModel, type EditoraModel } from '$lib/server/models/editora';
import { editoraSchema } from '$lib/validation/editora';
import { error, fail } from '@sveltejs/kit';

import type { Actions } from './$types';

type CreateModel = Pick<EditoraModel, 'create'>;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const _createNewEditoraHandlers = (model: CreateModel) => ({
	actions: {
		default: async ({ request }: { request: Request }) => {
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = editoraSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: result.error.flatten().fieldErrors });

			try {
				await model.create(result.data.nome);

				return { status: 201 };
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao criar uma nova editora' });
			}
		},
	},
});

const handlers = _createNewEditoraHandlers(editoraModel);

export const actions: Actions = handlers.actions;

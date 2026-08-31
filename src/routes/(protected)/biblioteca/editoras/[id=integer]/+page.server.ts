import { editoraModel, type EditoraModel } from '$lib/server/models/editora';
import { editoraSchema } from '$lib/validation/editora';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';

import type { Actions, PageServerLoad } from './$types';

type EditModel = Pick<EditoraModel, 'get' | 'update'>;
type User = { roles: string } | null;

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

const getPublisher = async (model: EditModel, id: number) => {
	try {
		return await model.get(id);
	} catch (cause) {
		console.error(cause);
		error(500, { message: 'Falha ao buscar os dados da editora' });
	}
};

const updatePublisher = async (model: EditModel, id: number, name: string) => {
	try {
		return await model.update(id, name);
	} catch (cause) {
		console.error(cause);
		error(500, { message: 'Falha ao atualizar os dados da editora' });
	}
};

const createInternalEditEditoraHandlers = (model: EditModel) => ({
	load: async ({ locals, params }: { locals: { user: User }; params: { id: string } }) => {
		requireLibraryAccess(locals.user);

		const publisher = await getPublisher(model, Number(params.id));

		if (!publisher) error(404, { message: 'Editora não encontrada.' });

		return { editora: publisher };
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
			const result = editoraSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			const updated = await updatePublisher(model, Number(params.id), result.data.nome);

			if (!updated) error(404, { message: 'Editora não encontrada.' });

			return { status: 200 };
		},
	},
});

const handlers = createInternalEditEditoraHandlers(editoraModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

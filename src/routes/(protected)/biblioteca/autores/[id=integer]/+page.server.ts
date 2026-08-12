import { autorModel, type AutorModel } from '$lib/server/models/autor';
import { autorSchema } from '$lib/validation/autor';
import { error, fail, redirect } from '@sveltejs/kit';

import type { Actions } from './$types';

type EditAutorModel = Pick<AutorModel, 'get' | 'update'>;
type EditLoadArgs = { locals: { user: unknown }; params: { id: string } };
type EditActionArgs = { request: Request; params: { id: string } };

async function getAuthor(model: EditAutorModel, id: number) {
	try {
		return await model.get(id);
	} catch (exception) {
		console.error(exception);
		error(500, { message: 'Falha ao baixar os dados do autor' });
	}
}

async function updateAuthor(model: EditAutorModel, id: number, name: string) {
	try {
		return await model.update(id, name);
	} catch (exception) {
		console.error(exception);
		error(500, { message: 'Falha ao atualizar os dados do autor' });
	}
}

export function _createEditAuthorHandlers(model: EditAutorModel) {
	const load = async ({ locals, params }: EditLoadArgs) => {
		if (!locals.user) redirect(302, '/');

		const author = await getAuthor(model, Number(params.id));
		if (!author) error(404, { message: 'Autor não encontrado.' });
		return { autor: author };
	};

	const actions = {
		default: async ({ request, params }: EditActionArgs) => {
			const formData = await request.formData();
			const nome = formData.get('nome');
			const values = { nome: typeof nome === 'string' ? nome : '' };
			const result = autorSchema.safeParse({ nome });
			if (!result.success) return fail(400, { values, errors: result.error.flatten().fieldErrors });

			const updated = await updateAuthor(model, Number(params.id), result.data.nome);
			if (!updated) error(404, { message: 'Autor não encontrado.' });
			return { status: 200 };
		},
	} satisfies Actions;

	return { load, actions };
}

export const { load, actions } = _createEditAuthorHandlers(autorModel);

import { authorSchema } from '$lib/validation/autor';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import type { AutorModel } from '$lib/server/models/autor';

type EditModel = Pick<AutorModel, 'get' | 'update'>;
type User = { roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const createAuthorEditHandlers = ({ model }: { model: EditModel }) => ({
	load: async ({ locals, params }: LoadContext) => {
		requireLibraryAccess(locals.user);
		let author;
		try {
			author = await model.get(Number(params.id));
		} catch (cause) {
			console.error(cause);
			error(500, { message: 'Falha ao baixar os dados do autor' });
		}
		if (!author) error(404, { message: 'Autor nÃ£o encontrado.' });
		return { autor: author };
	},
	actions: {
		default: async ({ locals, request, params }: ActionContext) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = authorSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };
			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });
			let updated;
			try {
				updated = await model.update(Number(params.id), result.data.nome);
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao atualizar os dados do autor' });
			}
			if (!updated) error(404, { message: 'Autor nÃ£o encontrado.' });
			return { status: 200 };
		},
	},
});

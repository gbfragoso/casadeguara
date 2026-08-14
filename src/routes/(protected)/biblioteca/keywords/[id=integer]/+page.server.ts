import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { keywordModel, type KeywordModel } from '$lib/server/models/keyword';
import { keywordSchema } from '$lib/validation/keyword';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import type { Actions, PageServerLoad } from './$types';

type EditModel = Pick<KeywordModel, 'get' | 'update'>;
type User = { roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

const getSubmittedKey = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const _createEditKeywordHandlers = (model: EditModel) => ({
	load: async ({ locals, params }: LoadContext) => {
		requireLibraryAccess(locals.user);
		const id = Number(params.id);
		let found;

		try {
			found = await model.get(id);
		} catch (cause) {
			console.error(cause);
			error(500, { message: 'Falha ao recuperar os dados da palavra-chave' });
		}

		if (!found) error(404, { message: 'Palavra-chave não encontrada.' });
		return { keyword: found };
	},
	actions: {
		default: async ({ locals, request, params }: ActionContext) => {
			requireLibraryAccess(locals.user);
			const form = await request.formData();
			const rawKey = form.get('chave');
			const result = keywordSchema.safeParse({ chave: rawKey });
			const values = { chave: getSubmittedKey(rawKey) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			const id = Number(params.id);
			let updated;

			try {
				updated = await model.update(id, result.data.chave);
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao atualizar os dados da palavra-chave' });
			}

			if (!updated) error(404, { message: 'Palavra-chave não encontrada.' });
			return { status: 200 };
		},
	},
});

const handlers = _createEditKeywordHandlers(keywordModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { keywordModel, type KeywordModel } from '$lib/server/models/keyword';
import { keywordSchema } from '$lib/validation/keyword';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import type { Actions, PageServerLoad } from './$types';

type CreateModel = Pick<KeywordModel, 'create'>;
type User = { roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const getSubmittedKey = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const _createNewKeywordHandlers = (model: CreateModel) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => {
		requireLibraryAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireLibraryAccess(locals.user);
			const form = await request.formData();
			const rawKey = form.get('chave');
			const result = keywordSchema.safeParse({ chave: rawKey });
			const values = { chave: getSubmittedKey(rawKey) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			try {
				await model.create(result.data.chave);

				return { status: 201 };
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao cadastrar nova palavra-chave' });
			}
		},
	},
});

const handlers = _createNewKeywordHandlers(keywordModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

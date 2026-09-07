import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { type KeywordModel } from '$lib/server/models/keyword';
import { keywordSearchSchema } from '$lib/validation/keyword';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

type ListModel = Pick<KeywordModel, 'fetch'>;
type User = { roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const getSubmittedKey = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const createKeywordListHandlers = ({ model }: { model: ListModel }) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => {
		requireLibraryAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireLibraryAccess(locals.user);
			const form = await request.formData();
			const rawKey = form.get('chave');
			const result = keywordSearchSchema.safeParse({ chave: rawKey });
			const values = { chave: getSubmittedKey(rawKey) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			try {
				const keywords = await model.fetch(result.data.chave);

				return { keywords, values: { chave: result.data.chave } };
			} catch (cause) {
				console.error(cause);
				error(500, { message: 'Falha ao carregar a lista de palavras-chave' });
			}
		},
	},
});

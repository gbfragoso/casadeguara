import { requireLibraryAccess } from '$lib/server/authorization/biblioteca';
import { type ColecaoModel } from '$lib/server/models/colecao';
import { colecaoSearchSchema } from '$lib/validation/colecao';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

type ListModel = Pick<ColecaoModel, 'fetch'>;
type User = { roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const getSubmittedName = (value: FormDataEntryValue | null) => (typeof value === 'string' ? value : '');

export const createCollectionListHandlers = ({ model }: { model: ListModel }) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => {
		requireLibraryAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireLibraryAccess(locals.user);
			const formData = await request.formData();
			const rawName = formData.get('nome');
			const result = colecaoSearchSchema.safeParse({ nome: rawName });
			const values = { nome: getSubmittedName(rawName) };

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			try {
				const colecoes = await model.fetch(result.data.nome);

				return { colecoes, values: { nome: result.data.nome } };
			} catch (cause) {
				console.error('Falha ao carregar a lista de coleções', cause);
				error(500, { message: 'Falha ao carregar a lista de coleções' });
			}
		},
	},
});

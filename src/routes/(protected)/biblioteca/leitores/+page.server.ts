import { cadastroModel, type CadastroModel } from '$lib/server/models/cadastro';
import { bibliotecaSearchSchema } from '$lib/validation/cadastros/biblioteca';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireReaderAccess } from '$lib/server/biblioteca/readers/access';
import { getReaderSearchValues } from '$lib/server/biblioteca/readers/form';
import type { Actions, PageServerLoad } from './$types';

type ListModel = Pick<CadastroModel, 'fetchBiblioteca'>;
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const createInternalReaderListHandlers = (model: ListModel) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => requireReaderAccess(locals.user),
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireReaderAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = bibliotecaSearchSchema.safeParse(input);
			const values = getReaderSearchValues(input);

			if (!result.success) return fail(400, { values, errors: flattenError(result.error).fieldErrors });

			try {
				const leitores = (await model.fetchBiblioteca(result.data.nome)).map((leitor) => ({
					idleitor: leitor.idleitor,
					nome: leitor.nome,
					trab: leitor.trab,
					status: leitor.status,
				}));

				return { leitores, values: { nome: result.data.nome } };
			} catch {
				console.error('Falha ao carregar a lista de leitores.');
				error(500, { message: 'Falha ao carregar a lista de leitores.' });
			}
		},
	},
});

const handlers = createInternalReaderListHandlers(cadastroModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

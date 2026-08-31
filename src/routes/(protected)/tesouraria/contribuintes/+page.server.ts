import { cadastroModel, type CadastroModel } from '$lib/server/models/cadastro';
import { tesourariaSearchSchema } from '$lib/validation/cadastros/tesouraria';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireTesourariaAccess } from '$lib/server/tesouraria/contributors/access';
import { getTesourariaErrors, getTesourariaSearchValues } from '$lib/server/tesouraria/contributors/form';
import type { Actions, PageServerLoad } from './$types';

type ListModel = Pick<CadastroModel, 'fetchTesouraria'>;
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

const createInternalContributorListHandlers = (model: ListModel) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => {
		requireTesourariaAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireTesourariaAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = tesourariaSearchSchema.safeParse(input);
			const values = getTesourariaSearchValues(input);

			if (!result.success) {
				const errors = flattenError(result.error);
				return fail(400, { values, errors: getTesourariaErrors(errors.fieldErrors, errors.formErrors) });
			}

			try {
				const contribuintes = (await model.fetchTesouraria(result.data.nome)).map(
					({ idleitor, nome, telefone, trab }) => ({ idleitor, nome, telefone, trab }),
				);

				return { contribuintes, values };
			} catch {
				console.error('Falha ao carregar a lista de contribuintes.');
				error(500, { message: 'Falha ao carregar a lista de contribuintes.' });
			}
		},
	},
});

const handlers = createInternalContributorListHandlers(cadastroModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

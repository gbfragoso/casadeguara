import { type CadastroModel } from '$lib/server/models/cadastro';
import { secretariaSearchSchema } from '$lib/validation/cadastros/secretaria';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireSecretariaAccess } from '$lib/server/secretaria/access';
import { getSecretariaErrors, getSecretariaSearchValues } from '$lib/server/secretaria/form';
type ListModel = Pick<CadastroModel, 'fetchSecretaria'>;
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

export const createRegistrationListHandlers = ({ model }: { model: ListModel }) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => requireSecretariaAccess(locals.user),
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireSecretariaAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = secretariaSearchSchema.safeParse(input);
			const values = getSecretariaSearchValues(input);

			if (!result.success) {
				const errors = flattenError(result.error);
				return fail(400, { values, errors: getSecretariaErrors(errors.fieldErrors, errors.formErrors) });
			}

			try {
				const cadastros = await model.fetchSecretaria(result.data.nome, result.data.trabalhadores);
				const lista = cadastros.map(({ idleitor, nome, trab, frequencia, desencarnado, amigoFraterno }) => ({
					idleitor,
					nome,
					trab,
					frequencia,
					desencarnado,
					amigoFraterno,
				}));

				return { cadastros: lista, values };
			} catch {
				console.error('Falha ao carregar a lista de cadastros.');
				error(500, { message: 'Falha ao carregar a lista de cadastros.' });
			}
		},
	},
});

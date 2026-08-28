import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { cadastroModel, type CadastroModel } from '$lib/server/models/cadastro';
import { secretariaCreateSchema } from '$lib/validation/cadastros/secretaria';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireSecretariaAccess } from '$lib/server/secretaria/access';
import { getSecretariaErrors, getSecretariaFormValues } from '$lib/server/secretaria/form';
import type { Actions } from './$types';

type CreateModel = Pick<CadastroModel, 'createSecretaria'>;
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

export const _createNewSecretariaHandlers = (model: CreateModel) => ({
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			const user = requireSecretariaAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = secretariaCreateSchema.safeParse(input);
			const values = getSecretariaFormValues(input);

			if (!result.success) {
				const errors = flattenError(result.error);
				return fail(400, { values, errors: getSecretariaErrors(errors.fieldErrors, errors.formErrors) });
			}

			try {
				await model.createSecretaria(result.data, user.id);

				return { status: 201 };
			} catch (cause) {
				if (cause instanceof DuplicateCadastroNameError) {
					return fail(400, { values, errors: getSecretariaErrors({ nome: [cause.message] }) });
				}

				console.error('Falha ao criar um novo trabalhador.');
				error(500, { message: 'Falha ao criar um novo trabalhador.' });
			}
		},
	},
});

const handlers = _createNewSecretariaHandlers(cadastroModel);

export const actions: Actions = handlers.actions;

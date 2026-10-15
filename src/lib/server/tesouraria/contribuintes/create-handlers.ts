import { DuplicateCadastroNameError } from '#lib/server/models/cadastro-error.js';
import { type CadastroModel } from '#lib/server/models/cadastro.js';
import { tesourariaCreateSchema } from '#lib/validation/cadastros/tesouraria.js';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireTesourariaAccess } from '#lib/server/tesouraria/contributors/access.js';
import { getTesourariaErrors, getTesourariaFormValues } from '#lib/server/tesouraria/contributors/form.js';
type CreateModel = Pick<CadastroModel, 'createTesouraria'>;
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

export const createContributorCreateHandlers = ({ model }: { model: CreateModel }) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => {
		requireTesourariaAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			const user = requireTesourariaAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = tesourariaCreateSchema.safeParse(input);
			const values = getTesourariaFormValues(input);

			if (!result.success) {
				const errors = flattenError(result.error);
				return fail(400, { values, errors: getTesourariaErrors(errors.fieldErrors, errors.formErrors) });
			}

			try {
				await model.createTesouraria({ ...result.data, trab: result.data.trab ?? false }, user.id);

				return { status: 201 };
			} catch (cause) {
				if (cause instanceof DuplicateCadastroNameError) {
					return fail(400, { values, errors: getTesourariaErrors({ nome: [cause.message] }) });
				}

				console.error('Falha ao criar um novo contribuinte.');
				error(500, 'Falha ao criar um novo contribuinte.');
			}
		},
	},
});

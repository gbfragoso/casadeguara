import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { cadastroModel, type CadastroModel } from '$lib/server/models/cadastro';
import { bibliotecaCreateSchema } from '$lib/validation/cadastros/biblioteca';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireReaderAccess } from '../reader-access';
import { getReaderErrors, getReaderFormValues } from '../reader-form';
import type { Actions, PageServerLoad } from './$types';

type CreateModel = Pick<CadastroModel, 'createBiblioteca'>;
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; request: Request };

export const _createNewReaderHandlers = (model: CreateModel) => ({
	load: ({ locals }: Pick<ActionContext, 'locals'>) => requireReaderAccess(locals.user),
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			const user = requireReaderAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = bibliotecaCreateSchema.safeParse(input);
			const values = getReaderFormValues(input);

			if (!result.success)
				return fail(400, { values, errors: getReaderErrors(flattenError(result.error).fieldErrors) });

			try {
				await model.createBiblioteca(result.data, user.id);

				return { status: 201 };
			} catch (cause) {
				if (cause instanceof DuplicateCadastroNameError) {
					return fail(400, { values, errors: getReaderErrors({ nome: [cause.message] }) });
				}

				console.error('Falha ao criar um novo leitor.');
				error(500, { message: 'Falha ao criar um novo leitor.' });
			}
		},
	},
});

const handlers = _createNewReaderHandlers(cadastroModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

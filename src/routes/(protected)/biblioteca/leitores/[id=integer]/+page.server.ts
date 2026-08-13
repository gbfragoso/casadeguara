import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { cadastroModel, type CadastroModel } from '$lib/server/models/cadastro';
import { bibliotecaUpdateSchema } from '$lib/validation/cadastros/biblioteca';
import { error, fail } from '@sveltejs/kit';

import { requireReaderAccess } from '../reader-access';
import { toReaderDetail } from '../reader-detail';
import { getReaderErrors, getReaderFormValues } from '../reader-form';
import type { Actions, PageServerLoad } from './$types';

type EditModel = Pick<CadastroModel, 'getBiblioteca' | 'updateBiblioteca'>;
type User = { id: string; roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

const getReader = async (model: EditModel, id: number) => {
	try {
		return await model.getBiblioteca(id);
	} catch {
		console.error('Falha ao recuperar os dados do leitor.');
		error(500, { message: 'Falha ao recuperar os dados do leitor.' });
	}
};

export const _createEditReaderHandlers = (model: EditModel) => ({
	load: async ({ locals, params }: LoadContext) => {
		requireReaderAccess(locals.user);
		const id = Number(params.id);
		const reader = await getReader(model, id);

		if (!reader) error(404, { message: 'Leitor não encontrado.' });
		return { leitor: toReaderDetail(reader) };
	},
	actions: {
		default: async ({ locals, params, request }: ActionContext) => {
			const user = requireReaderAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = bibliotecaUpdateSchema.safeParse(input);
			const values = getReaderFormValues(input);

			if (!result.success) return fail(400, { values, errors: getReaderErrors(result.error.flatten().fieldErrors) });

			const id = Number(params.id);
			try {
				const updated = await model.updateBiblioteca(id, result.data, user.id);

				if (updated) return { status: 200 };
			} catch (cause) {
				if (cause instanceof DuplicateCadastroNameError) {
					return fail(400, { values, errors: getReaderErrors({ nome: [cause.message] }) });
				}

				console.error('Falha ao atualizar os dados do leitor.');
				error(500, { message: 'Falha ao atualizar os dados do leitor.' });
			}

			error(404, { message: 'Leitor não encontrado.' });
		},
	},
});

const handlers = _createEditReaderHandlers(cadastroModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

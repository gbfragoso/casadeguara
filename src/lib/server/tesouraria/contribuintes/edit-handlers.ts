import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { type CadastroModel } from '$lib/server/models/cadastro';
import { tesourariaUpdateSchema } from '$lib/validation/cadastros/tesouraria';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireTesourariaAccess } from '$lib/server/tesouraria/contributors/access';
import { getTesourariaErrors, getTesourariaFormValues } from '$lib/server/tesouraria/contributors/form';
type EditModel = Pick<CadastroModel, 'getTesouraria' | 'updateTesouraria'>;
type User = { id: string; roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

const getContributor = async (model: EditModel, id: number) => {
	try {
		return await model.getTesouraria(id);
	} catch {
		console.error('Falha ao recuperar os dados do contribuinte.');
		error(500, { message: 'Falha ao recuperar os dados do contribuinte.' });
	}
};

export const createContributorEditHandlers = ({ model }: { model: EditModel }) => ({
	load: async ({ locals, params }: LoadContext) => {
		requireTesourariaAccess(locals.user);
		const contribuinte = await getContributor(model, Number(params.id));

		if (!contribuinte) error(404, { message: 'Contribuinte não encontrado.' });
		return { contribuinte: { nome: contribuinte.nome, telefone: contribuinte.telefone, trab: contribuinte.trab } };
	},
	actions: {
		default: async ({ locals, params, request }: ActionContext) => {
			const user = requireTesourariaAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = tesourariaUpdateSchema.safeParse(input);
			const values = getTesourariaFormValues(input);

			if (!result.success) {
				const errors = flattenError(result.error);
				return fail(400, { values, errors: getTesourariaErrors(errors.fieldErrors, errors.formErrors) });
			}

			try {
				const updated = await model.updateTesouraria(Number(params.id), result.data, user.id);
				if (updated) return { status: 200 };
			} catch (cause) {
				if (cause instanceof DuplicateCadastroNameError) {
					return fail(400, { values, errors: getTesourariaErrors({ nome: [cause.message] }) });
				}

				console.error('Falha ao atualizar os dados do contribuinte.');
				error(500, { message: 'Falha ao atualizar os dados do contribuinte.' });
			}

			error(404, { message: 'Contribuinte não encontrado.' });
		},
	},
});

import { DuplicateCadastroNameError } from '$lib/server/models/cadastro-error';
import { cadastroModel, type CadastroModel } from '$lib/server/models/cadastro';
import { secretariaPhotoModel, type SecretariaPhotoModel } from '$lib/server/models/secretaria-photo';
import { secretariaUpdateSchema } from '$lib/validation/cadastros/secretaria';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireSecretariaAccess } from '../secretaria-access';
import { toSecretariaDetail } from '../secretaria-detail';
import { getSecretariaErrors, getSecretariaFormValues } from '../secretaria-form';
import { reframePhoto, removePhoto, savePhoto } from '../photo-actions';
import type { Actions, PageServerLoad } from './$types';

type EditModel = Pick<CadastroModel, 'getSecretaria' | 'updateSecretaria'>;
type PhotoModel = Pick<SecretariaPhotoModel, 'replace' | 'remove' | 'getSource' | 'reframe'>;
type User = { id: string; roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

const getSecretaria = async (model: EditModel, id: number) => {
	try {
		return await model.getSecretaria(id);
	} catch {
		console.error('Falha ao recuperar os dados do trabalhador.');
		error(500, { message: 'Falha ao recuperar os dados do trabalhador.' });
	}
};

export const _createEditSecretariaHandlers = (model: EditModel, photoModel: PhotoModel = secretariaPhotoModel) => ({
	load: async ({ locals, params }: LoadContext) => {
		requireSecretariaAccess(locals.user);
		const id = Number(params.id);
		const cadastro = await getSecretaria(model, id);

		if (!cadastro) error(404, { message: 'Trabalhador não encontrado.' });
		return { id, trabalhador: toSecretariaDetail(cadastro) };
	},
	actions: {
		salvarCadastro: async ({ locals, params, request }: ActionContext) => {
			const user = requireSecretariaAccess(locals.user);
			const input: unknown = Object.fromEntries(await request.formData());
			const result = secretariaUpdateSchema.safeParse(input);
			const values = getSecretariaFormValues(input);

			if (!result.success) {
				const errors = flattenError(result.error);
				return fail(400, { values, errors: getSecretariaErrors(errors.fieldErrors, errors.formErrors) });
			}

			const id = Number(params.id);
			try {
				const updated = await model.updateSecretaria(id, result.data, user.id);

				if (updated) return { status: 200 };
			} catch (cause) {
				if (cause instanceof DuplicateCadastroNameError) {
					return fail(400, { values, errors: getSecretariaErrors({ nome: [cause.message] }) });
				}

				console.error('Falha ao atualizar os dados do trabalhador.');
				error(500, { message: 'Falha ao atualizar os dados do trabalhador.' });
			}

			error(404, { message: 'Trabalhador não encontrado.' });
		},
		salvarFoto: (context: ActionContext) => savePhoto(photoModel, context),
		reenquadrarFoto: (context: ActionContext) => reframePhoto(photoModel, context),
		removerFoto: (context: ActionContext) => removePhoto(photoModel, context),
	},
});

const handlers = _createEditSecretariaHandlers(cadastroModel);

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

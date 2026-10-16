import { DuplicateCadastroNameError } from '#lib/server/models/cadastro-error.js';
import { type CadastroModel } from '#lib/server/models/cadastro.js';
import { type SecretariaPhotoModel } from '#lib/server/models/secretaria-photo.js';
import { secretariaUpdateSchema } from '#lib/validation/cadastros/secretaria.js';
import { error, fail } from '@sveltejs/kit';
import { flattenError } from 'zod';

import { requireSecretariaAccess } from '#lib/server/secretaria/access.js';
import { toSecretariaDetail } from '#lib/server/secretaria/detail.js';
import { getSecretariaErrors, getSecretariaFormValues } from '#lib/server/secretaria/form.js';
import { reframePhoto, removePhoto, savePhoto } from '#lib/server/secretaria/photo/actions.js';
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
		error(500, 'Falha ao recuperar os dados do trabalhador.');
	}
};

export const createSecretariaRegistrationEditHandlers = ({
	model,
	photoModel,
}: {
	model: EditModel;
	photoModel: PhotoModel;
}) => ({
	load: async ({ locals, params }: LoadContext) => {
		requireSecretariaAccess(locals.user);
		const id = Number(params.id);
		const cadastro = await getSecretaria(model, id);

		if (!cadastro) error(404, 'Trabalhador não encontrado.');
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
				error(500, 'Falha ao atualizar os dados do trabalhador.');
			}

			error(404, 'Trabalhador não encontrado.');
		},
		salvarFoto: (context: ActionContext) => savePhoto(photoModel, context),
		reenquadrarFoto: (context: ActionContext) => reframePhoto(photoModel, context),
		removerFoto: (context: ActionContext) => removePhoto(photoModel, context),
	},
});

import { normalizePhoto, InvalidPhotoError } from '$lib/server/amigo-fraterno/photo-normalizer';
import type { SecretariaPhotoModel } from '$lib/server/models/secretaria-photo';
import { photoUploadSchema } from '$lib/validation/cadastros/foto';
import { error, fail } from '@sveltejs/kit';

import { requireSecretariaAccess } from './secretaria-access';

type PhotoModel = Pick<SecretariaPhotoModel, 'replace' | 'remove'>;
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; params: { id: string }; request: Request };

const getPhotoInput = async (request: Request) =>
	photoUploadSchema.safeParse(Object.fromEntries(await request.formData()));

export const savePhoto = async (model: PhotoModel, { locals, params, request }: ActionContext) => {
	const user = requireSecretariaAccess(locals.user);
	const result = await getPhotoInput(request);
	if (!result.success)
		return fail(400, { operation: 'photoSaved', errors: { foto: ['Foto inválida.'] } as Record<string, string[]> });

	try {
		const photo = await normalizePhoto(result.data);
		if (await model.replace(Number(params.id), photo.bytes, photo.bytes, user.id)) {
			return { operation: 'photoSaved', status: 200 };
		}
	} catch (cause) {
		if (cause instanceof InvalidPhotoError) {
			return fail(400, {
				operation: 'photoSaved',
				errors: { foto: [cause.message] } as Record<string, string[]>,
			});
		}

		console.error('Falha ao salvar a foto do trabalhador.');
		error(500, { message: 'Falha ao salvar a foto do trabalhador.' });
	}

	error(404, { message: 'Trabalhador não encontrado.' });
};

export const removePhoto = async (model: PhotoModel, { locals, params }: ActionContext) => {
	const user = requireSecretariaAccess(locals.user);
	try {
		if (await model.remove(Number(params.id), user.id)) {
			return { operation: 'photoRemoved', status: 200 };
		}
	} catch {
		console.error('Falha ao remover a foto do trabalhador.');
		error(500, { message: 'Falha ao remover a foto do trabalhador.' });
	}

	error(404, { message: 'Trabalhador não encontrado.' });
};

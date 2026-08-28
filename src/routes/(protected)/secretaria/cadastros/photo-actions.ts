import { createCardPhoto } from '$lib/server/amigo-fraterno/photo-cropper';
import { InvalidPhotoError, normalizePhotoSource } from '$lib/server/amigo-fraterno/photo-normalizer';
import type { SecretariaPhotoModel } from '$lib/server/models/secretaria-photo';

import { INVALID_PHOTO_MESSAGE, PHOTO_POSITION_MESSAGE } from '$lib/validation/cadastros/foto';
import { error, fail } from '@sveltejs/kit';

import {
	missingCadastro,
	missingPhoto,
	getPhotoInput,
	getPositionInput,
	rejectInput,
	rejectMalformedInput,
	requireSource,
	type PhotoActionData,
} from './photo-action-utils';
import { requireSecretariaAccess } from './secretaria-access';

type SavePhotoModel = Pick<SecretariaPhotoModel, 'replace'>;
type ReframePhotoModel = Pick<SecretariaPhotoModel, 'getSource' | 'reframe'>;
type RemovePhotoModel = Pick<SecretariaPhotoModel, 'remove'>;
type User = { id: string; roles: string } | null;
type ActionContext = { locals: { user: User }; params: { id: string }; request: Request };

export const savePhoto = async (model: SavePhotoModel, { locals, params, request }: ActionContext) => {
	const user = requireSecretariaAccess(locals.user);
	const result = await getPhotoInput(request);
	if (!result) return rejectMalformedInput('photoSaved', 'foto', INVALID_PHOTO_MESSAGE);
	if (!result.success) return rejectInput('photoSaved', result);

	try {
		const photo = await normalizePhotoSource(result.data.foto);
		const card = await createCardPhoto(photo.bytes, result.data);
		if (await model.replace(Number(params.id), photo.bytes, card, user.id)) {
			return { operation: 'photoSaved', status: 200 };
		}
	} catch (cause) {
		if (cause instanceof InvalidPhotoError) {
			return fail<PhotoActionData>(400, {
				operation: 'photoSaved',
				errors: { foto: [cause.message] },
			});
		}
		console.error('Falha ao salvar a foto do trabalhador.');
		error(500, { message: 'Falha ao salvar a foto do trabalhador.' });
	}

	missingCadastro();
};

export const reframePhoto = async (model: ReframePhotoModel, { locals, params, request }: ActionContext) => {
	const user = requireSecretariaAccess(locals.user);
	const result = await getPositionInput(request);
	if (!result) return rejectMalformedInput('photoReframed', 'enquadramento', PHOTO_POSITION_MESSAGE);
	if (!result.success) return rejectInput('photoReframed', result);

	const id = Number(params.id);
	let source: Uint8Array | null | undefined;
	try {
		source = await model.getSource(id);
	} catch {
		console.error('Falha ao ler a origem da foto do trabalhador.');
		error(500, { message: 'Falha ao reenquadrar a foto do trabalhador.' });
	}
	const sourceBytes = requireSource(source);

	try {
		const card = await createCardPhoto(sourceBytes, result.data);
		const outcome = await model.reframe(id, sourceBytes, card, user.id);
		if (outcome === 'updated') return { operation: 'photoReframed', status: 200 };
		if (outcome === 'conflict')
			return fail<PhotoActionData>(409, {
				operation: 'photoReframed',
				errors: {
					enquadramento: ['A foto foi alterada em outra operação. Recarregue a página e tente novamente.'],
				},
			});
	} catch {
		console.error('Falha ao reenquadrar a foto do trabalhador.');
		error(500, { message: 'Falha ao reenquadrar a foto do trabalhador.' });
	}

	missingPhoto();
};

export const removePhoto = async (model: RemovePhotoModel, { locals, params }: ActionContext) => {
	const user = requireSecretariaAccess(locals.user);
	try {
		if (await model.remove(Number(params.id), user.id)) {
			return { operation: 'photoRemoved', status: 200 };
		}
	} catch {
		console.error('Falha ao remover a foto do trabalhador.');
		error(500, { message: 'Falha ao remover a foto do trabalhador.' });
	}

	missingCadastro();
};

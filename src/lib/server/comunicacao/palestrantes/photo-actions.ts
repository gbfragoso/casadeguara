import { requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import { createSquarePhoto, createThumbnail } from '#lib/server/image/cropper.js';
import { InvalidPhotoError, normalizePhotoSource } from '#lib/server/image/normalizer.js';
import { getPhotoInput, getPositionInput, toPhotoErrors } from '#lib/server/image/photo-form.js';
import type { PalestranteModel } from '#lib/server/models/palestrante.js';
import type { SpeakerPhotoSet } from '#lib/server/models/palestrante-photo.js';
import type { PhotoPositionInput, PhotoUploadFormInput } from '#lib/validation/photo.js';
import { INVALID_PHOTO_MESSAGE, PHOTO_POSITION_MESSAGE } from '#lib/validation/photo.js';
import { error, fail } from '@sveltejs/kit';

import { failSpeakerOperation, missingSpeaker, runSpeakerOperation } from './failures';

export type SpeakerPhotoModel = Pick<PalestranteModel, 'getPhoto' | 'replacePhoto' | 'reframePhoto' | 'removePhoto'>;
export type PhotoActionData = {
	operation: 'photoSaved' | 'photoReframed' | 'photoRemoved';
	status?: number;
	errors?: Record<string, string[]>;
};

type User = { id: string; roles: string } | null;
type PhotoActionContext = { locals: { user: User }; params: { id: string }; request: Request };
type Rejection = { operation: 'photoSaved' | 'photoReframed'; palestranteId: number; actorId: string };

const UPDATED_STATUS = 200;
const REFRAME_CONFLICT_MESSAGE = 'A foto foi alterada em outra operação. Recarregue a página e tente novamente.';

const rejectPhoto = (
	{ operation, palestranteId, actorId }: Rejection,
	reason: string,
	errors: PhotoActionData['errors'],
) => {
	console.warn('comunicacao.palestrantes.foto_rejeitada', { palestranteId, actorId, reason });
	return fail<PhotoActionData>(400, { operation, errors });
};

const createFramedPhotos = async (original: Uint8Array, position: PhotoPositionInput): Promise<SpeakerPhotoSet> => {
	const quadrada = await createSquarePhoto(original, position);
	return { original, quadrada, miniatura: await createThumbnail(quadrada) };
};

const createUploadedPhotos = async (input: PhotoUploadFormInput) => {
	const normalized = await normalizePhotoSource(input.foto);
	return createFramedPhotos(normalized.bytes, input);
};

const savePhoto = async (speakers: SpeakerPhotoModel, { locals, params, request }: PhotoActionContext) => {
	const user = requireComunicacaoAccess(locals.user);
	const rejection: Rejection = { operation: 'photoSaved', palestranteId: Number(params.id), actorId: user.id };

	const input = await getPhotoInput(request);
	if (!input) return rejectPhoto(rejection, 'multipart', { foto: [INVALID_PHOTO_MESSAGE] });
	if (!input.success) return rejectPhoto(rejection, 'validation', toPhotoErrors(input));

	let photos: SpeakerPhotoSet;
	try {
		photos = await createUploadedPhotos(input.data);
	} catch (cause) {
		if (cause instanceof InvalidPhotoError) return rejectPhoto(rejection, cause.reason, { foto: [cause.message] });
		return failSpeakerOperation('salvar_foto', rejection.palestranteId, cause);
	}

	const id = rejection.palestranteId;
	const saved = await runSpeakerOperation('salvar_foto', id, () => speakers.replacePhoto(id, photos, user.id));
	return saved ? { operation: 'photoSaved' as const, status: UPDATED_STATUS } : missingSpeaker();
};

const readOriginalPhoto = async (speakers: SpeakerPhotoModel, id: number) => {
	const original = await runSpeakerOperation('reenquadrar_foto', id, () => speakers.getPhoto(id, 'original'));
	return original ?? error(404, 'Foto não encontrada.');
};

const reframePhoto = async (speakers: SpeakerPhotoModel, { locals, params, request }: PhotoActionContext) => {
	const user = requireComunicacaoAccess(locals.user);
	const id = Number(params.id);

	const input = await getPositionInput(request);
	const rejection: Rejection = { operation: 'photoReframed', palestranteId: id, actorId: user.id };
	if (!input) return rejectPhoto(rejection, 'multipart', { enquadramento: [PHOTO_POSITION_MESSAGE] });
	if (!input.success) return rejectPhoto(rejection, 'validation', toPhotoErrors(input));

	const original = await readOriginalPhoto(speakers, id);
	const outcome = await runSpeakerOperation('reenquadrar_foto', id, async () =>
		speakers.reframePhoto(id, await createFramedPhotos(original, input.data), user.id),
	);
	if (outcome === 'updated') return { operation: 'photoReframed' as const, status: UPDATED_STATUS };
	if (outcome === 'conflict') {
		return fail<PhotoActionData>(409, {
			operation: 'photoReframed',
			errors: { enquadramento: [REFRAME_CONFLICT_MESSAGE] },
		});
	}
	return error(404, 'Foto não encontrada.');
};

const removePhoto = async (speakers: SpeakerPhotoModel, { locals, params }: PhotoActionContext) => {
	const user = requireComunicacaoAccess(locals.user);

	const id = Number(params.id);
	const removed = await runSpeakerOperation('remover_foto', id, () => speakers.removePhoto(id, user.id));
	return removed ? { operation: 'photoRemoved' as const, status: UPDATED_STATUS } : missingSpeaker();
};

export const createSpeakerPhotoActions = ({ speakers }: { speakers: SpeakerPhotoModel }) => ({
	salvarFoto: (context: PhotoActionContext) => savePhoto(speakers, context),
	reenquadrarFoto: (context: PhotoActionContext) => reframePhoto(speakers, context),
	removerFoto: (context: PhotoActionContext) => removePhoto(speakers, context),
});

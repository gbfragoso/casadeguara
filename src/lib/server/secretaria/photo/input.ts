import { error, fail } from '@sveltejs/kit';
import type { ZodError } from 'zod';

import { toPhotoErrors } from '#lib/server/image/photo-form.js';

export type PhotoActionData = {
	operation: 'photoSaved' | 'photoReframed' | 'photoRemoved';
	status?: number;
	errors?: Record<string, string[]>;
};

export const rejectInput = (operation: 'photoSaved' | 'photoReframed', result: { error: ZodError }) => {
	console.warn('amigo_fraterno.photo_rejected', { reason: 'validation' });
	return fail<PhotoActionData>(400, { operation, errors: toPhotoErrors(result) });
};

export const rejectMalformedInput = (
	operation: 'photoSaved' | 'photoReframed',
	field: 'foto' | 'enquadramento',
	message: string,
) => {
	console.warn('amigo_fraterno.photo_rejected', { reason: 'multipart' });
	return fail<PhotoActionData>(400, { operation, errors: { [field]: [message] } });
};

export const missingCadastro = (): never => error(404, 'Trabalhador não encontrado.');
export const missingPhoto = (): never => error(404, 'Foto não encontrada.');

export const requireSource = (source: Uint8Array | null | undefined): Uint8Array => {
	if (!source) throw error(404, 'Foto não encontrada.');
	return source;
};

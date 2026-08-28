import { error, fail } from '@sveltejs/kit';
import { flattenError, type ZodError } from 'zod';

import { photoPositionSchema, photoUploadSchema } from '$lib/validation/cadastros/foto';

export type PhotoActionData = {
	operation: 'photoSaved' | 'photoReframed' | 'photoRemoved';
	status?: number;
	errors?: Record<string, string[]>;
};

const toErrors = (result: { error: ZodError }) => {
	const flattened = flattenError(result.error);
	const fieldErrors = Object.fromEntries(
		Object.entries(flattened.fieldErrors).filter((entry): entry is [string, string[]] => entry[1] !== undefined),
	);
	return flattened.formErrors.length > 0 ? { ...fieldErrors, form: flattened.formErrors } : fieldErrors;
};

export const getPhotoInput = async (request: Request) => {
	try {
		return photoUploadSchema.safeParse(Object.fromEntries(await request.formData()));
	} catch {
		return undefined;
	}
};

export const getPositionInput = async (request: Request) => {
	try {
		return photoPositionSchema.safeParse(Object.fromEntries(await request.formData()));
	} catch {
		return undefined;
	}
};

export const rejectInput = (operation: 'photoSaved' | 'photoReframed', result: { error: ZodError }) => {
	console.warn('amigo_fraterno.photo_rejected', { reason: 'validation' });
	return fail<PhotoActionData>(400, { operation, errors: toErrors(result) });
};

export const rejectMalformedInput = (
	operation: 'photoSaved' | 'photoReframed',
	field: 'foto' | 'enquadramento',
	message: string,
) => {
	console.warn('amigo_fraterno.photo_rejected', { reason: 'multipart' });
	return fail<PhotoActionData>(400, { operation, errors: { [field]: [message] } });
};

export const missingCadastro = (): never => error(404, { message: 'Trabalhador não encontrado.' });
export const missingPhoto = (): never => error(404, { message: 'Foto não encontrada.' });

export const requireSource = (source: Uint8Array | null | undefined): Uint8Array => {
	if (!source) throw error(404, { message: 'Foto não encontrada.' });
	return source;
};

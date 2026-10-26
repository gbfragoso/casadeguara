import { flattenError, type ZodError } from 'zod';

import { photoPositionSchema, photoUploadSchema } from '#lib/validation/photo.js';

export const toPhotoErrors = (result: { error: ZodError }): Record<string, string[]> => {
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

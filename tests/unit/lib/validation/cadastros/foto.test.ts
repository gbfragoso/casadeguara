import { File } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import { INVALID_PHOTO_MESSAGE, PHOTO_MAX_BYTES, photoUploadSchema } from '$lib/validation/cadastros/foto';
import { getFieldErrors } from '../field-errors';

const createPhoto = (size = 1, type = 'image/png') => new File([new Uint8Array(size)], 'foto.png', { type });

describe('photoUploadSchema', () => {
	it('accepts a declared PNG within the upload limit', () => {
		const result = photoUploadSchema.safeParse({ foto: createPhoto() });

		expect(result.success).toBe(true);
	});

	it.each([
		['missing photo', {}],
		['unsupported type', { foto: createPhoto(1, 'image/webp') }],
		['empty file', { foto: createPhoto(0) }],
		['oversized file', { foto: createPhoto(PHOTO_MAX_BYTES + 1) }],
	])('rejects a %s', (_, input) => {
		const result = photoUploadSchema.safeParse(input);

		expect(getFieldErrors(result)?.foto).toEqual([INVALID_PHOTO_MESSAGE]);
	});

	it('rejects unrecognized multipart fields', () => {
		const result = photoUploadSchema.safeParse({ foto: createPhoto(), extra: true });

		expect(result.success).toBe(false);
	});
});

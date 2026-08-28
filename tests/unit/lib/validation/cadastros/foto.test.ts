import { File } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import {
	INVALID_PHOTO_MESSAGE,
	PHOTO_MAX_BYTES,
	PHOTO_POSITION_MESSAGE,
	photoPositionSchema,
	photoUploadSchema,
} from '$lib/validation/cadastros/foto';
import { getFieldErrors } from '../field-errors';

const createPhoto = (size = 1, type = 'image/png') => new File([new Uint8Array(size)], 'foto.png', { type });
const validPosition = { focalX: '0.5', focalY: '0.5', zoom: '1' };

describe('photoUploadSchema', () => {
	it('accepts a declared PNG within the upload limit', () => {
		const result = photoUploadSchema.safeParse({ foto: createPhoto(), ...validPosition });

		expect(result.success).toBe(true);
	});

	it.each([
		['missing photo', validPosition],
		['unsupported type', { ...validPosition, foto: createPhoto(1, 'image/webp') }],
		['empty file', { ...validPosition, foto: createPhoto(0) }],
		['oversized file', { ...validPosition, foto: createPhoto(PHOTO_MAX_BYTES + 1) }],
	])('rejects a %s', (_, input) => {
		const result = photoUploadSchema.safeParse(input);

		expect(getFieldErrors(result)?.foto).toEqual([INVALID_PHOTO_MESSAGE]);
	});

	it('rejects unrecognized multipart fields', () => {
		const result = photoUploadSchema.safeParse({ foto: createPhoto(), ...validPosition, extra: true });

		expect(result.success).toBe(false);
	});
});

describe('photoPositionSchema', () => {
	it('coerces decimal strings to finite numbers once', () => {
		const result = photoPositionSchema.safeParse({ focalX: '0.63', focalY: '0.41', zoom: '1.35' });

		expect(result).toMatchObject({ success: true, data: { focalX: 0.63, focalY: 0.41, zoom: 1.35 } });
	});

	it.each([
		['missing focal point', { focalX: '', focalY: '0.5', zoom: '1' }, 'focalX'],
		['non-finite focal point', { focalX: 'Infinity', focalY: '0.5', zoom: '1' }, 'focalX'],
		['horizontal bound', { focalX: '1.1', focalY: '0.5', zoom: '1' }, 'focalX'],
		['vertical bound', { focalX: '0.5', focalY: '-0.1', zoom: '1' }, 'focalY'],
		['zoom bound', { focalX: '0.5', focalY: '0.5', zoom: '3.1' }, 'zoom'],
	] as const)('rejects %s with a field error', (_, input, field) => {
		const result = photoPositionSchema.safeParse(input);
		const errors = getFieldErrors(result);
		const fieldError = field === 'focalX' ? errors?.focalX : field === 'focalY' ? errors?.focalY : errors?.zoom;

		expect(fieldError).toEqual([PHOTO_POSITION_MESSAGE]);
	});

	it('rejects unrecognized position fields', () => {
		const result = photoPositionSchema.safeParse({ ...validPosition, extra: 'true' });

		expect(result.success).toBe(false);
	});
});

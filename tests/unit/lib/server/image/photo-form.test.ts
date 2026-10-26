import { describe, expect, it } from 'vitest';

import { getPhotoInput, getPositionInput, toPhotoErrors } from '#lib/server/image/photo-form.js';
import { INVALID_PHOTO_MESSAGE, PHOTO_MAX_BYTES, PHOTO_POSITION_MESSAGE } from '#lib/validation/photo.js';

const createUploadRequest = (photo: File, extraFields: Record<string, string> = {}) => {
	const form = new FormData();
	form.set('foto', photo);
	Object.entries({ focalX: '0.5', focalY: '0.5', zoom: '1', ...extraFields }).forEach(([name, value]) =>
		form.set(name, value),
	);
	return new Request('http://localhost', { method: 'POST', body: form });
};

const readUploadErrors = async (request: Request) => {
	const result = await getPhotoInput(request);
	if (!result || result.success) throw new Error('The upload should have been rejected.');
	return toPhotoErrors(result);
};

describe('getPhotoInput', () => {
	it('rejects a GIF on the photo field', async () => {
		const gif = new File(['GIF89a'], 'photo.gif', { type: 'image/gif' });

		const errors = await readUploadErrors(createUploadRequest(gif));

		expect(errors).toEqual({ foto: [INVALID_PHOTO_MESSAGE] });
	});

	it('rejects a file larger than 3 MiB on the photo field', async () => {
		const oversized = new File([new Uint8Array(PHOTO_MAX_BYTES + 1)], 'photo.png', { type: 'image/png' });

		const errors = await readUploadErrors(createUploadRequest(oversized));

		expect(errors).toEqual({ foto: [INVALID_PHOTO_MESSAGE] });
	});

	it('reports unknown multipart fields as a form error', async () => {
		const photo = new File(['photo'], 'photo.jpeg', { type: 'image/jpeg' });

		const errors = await readUploadErrors(createUploadRequest(photo, { cadastroId: '9' }));

		expect(errors).toEqual({ form: [INVALID_PHOTO_MESSAGE] });
	});

	it('returns nothing when the body is not a form', async () => {
		const request = new Request('http://localhost', { method: 'POST', body: 'not multipart' });

		expect(await getPhotoInput(request)).toBeUndefined();
	});
});

describe('getPositionInput', () => {
	it('reads the framing position as numbers', async () => {
		const body = new URLSearchParams({ focalX: '0.25', focalY: '0.75', zoom: '2' });

		const result = await getPositionInput(new Request('http://localhost', { method: 'POST', body }));

		expect(result?.data).toEqual({ focalX: 0.25, focalY: 0.75, zoom: 2 });
	});

	it('rejects a zoom outside the allowed range', async () => {
		const body = new URLSearchParams({ focalX: '0.5', focalY: '0.5', zoom: '4' });

		const result = await getPositionInput(new Request('http://localhost', { method: 'POST', body }));

		expect(result && !result.success && toPhotoErrors(result)).toEqual({ zoom: [PHOTO_POSITION_MESSAGE] });
	});

	it('returns nothing when the body is not a form', async () => {
		const request = new Request('http://localhost', { method: 'POST', body: 'not a form' });

		expect(await getPositionInput(request)).toBeUndefined();
	});
});

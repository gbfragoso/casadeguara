import { readFileSync } from 'node:fs';

export const context = {
	locals: { user: { id: 'secretaria-user', roles: 'secretaria' } },
	params: { id: '4' },
	request: new Request('http://localhost', { method: 'POST' }),
};

export const createPhotoRequest = (photo: File) => {
	const form = new FormData();
	form.set('foto', photo);
	form.set('focalX', '0.5');
	form.set('focalY', '0.5');
	form.set('zoom', '1');
	return new Request('http://localhost', { method: 'POST', body: form });
};

export const createPositionRequest = (position = { focalX: '0.5', focalY: '0.5', zoom: '1' }) =>
	new Request('http://localhost', { method: 'POST', body: new URLSearchParams(position) });

export const validPhoto = () =>
	new File([readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg')], 'photo.jpeg', { type: 'image/jpeg' });

export const sourcePhoto = () => new Uint8Array(readFileSync('tests/fixtures/amigo-fraterno-photo.jpeg'));

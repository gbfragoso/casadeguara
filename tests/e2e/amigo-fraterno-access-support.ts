import { expect, type APIRequestContext } from '@playwright/test';

import { readCadastro, type TestDatabase } from './cadastros-database';
import { createPhoto } from './amigo-fraterno-support';

const privatePhotoPath = (id: number, original = false) =>
	`/secretaria/cadastros/${id}/foto${original ? '/original' : ''}`;

const actionPath = (id: number, action: string) => `/secretaria/cadastros/${id}?/${action}`;

const assertUnauthorizedPhotoEndpoints = async (request: APIRequestContext, id: number, name: string) => {
	const card = await request.get(privatePhotoPath(id));
	const original = await request.get(privatePhotoPath(id, true));

	expect(card.status()).toBe(401);
	expect(original.status()).toBe(401);
	expect(card.headers()['content-type']).not.toContain('image/jpeg');
	expect(original.headers()['content-type']).not.toContain('image/jpeg');
	expect(await card.text()).not.toContain(name);
	expect(await original.text()).not.toContain(name);
};

const assertBlockedAction = async (
	response: Awaited<ReturnType<APIRequestContext['post']>>,
	status: number,
	name: string,
) => {
	expect(response.status()).toBe(status);
	if (status === 302) expect(response.headers().location).toBe('/');
	expect(await response.text()).not.toContain(name);
};

type PhotoMultipart = {
	foto: { name: string; mimeType: string; buffer: Buffer };
	focalX: string;
	focalY: string;
	zoom: string;
};

const postBlockedActions = (request: APIRequestContext, id: number, multipart: PhotoMultipart) =>
	Promise.all([
		request.post(actionPath(id, 'salvarFoto'), {
			multipart,
			headers: { accept: 'text/html' },
			maxRedirects: 0,
		}),
		request.post(actionPath(id, 'reenquadrarFoto'), {
			form: { focalX: '0.5', focalY: '0.5', zoom: '1' },
			headers: { accept: 'text/html' },
			maxRedirects: 0,
		}),
		request.post(actionPath(id, 'removerFoto'), {
			form: {},
			headers: { accept: 'text/html' },
			maxRedirects: 0,
		}),
	]);

const assertPhotoUnchanged = async (
	database: TestDatabase,
	name: string,
	before: Awaited<ReturnType<typeof readCadastro>>,
) => {
	const after = await readCadastro(database, name);
	expect(after).toEqual(before);
};

export const assertBlockedSecretariaAccess = async (
	request: APIRequestContext,
	database: TestDatabase,
	id: number,
	name: string,
	status: number,
) => {
	const before = await readCadastro(database, name);
	if (!before.foto) throw new Error('A fixture de foto não foi persistida.');
	await assertUnauthorizedPhotoEndpoints(request, id, name);
	const multipart = {
		foto: { name: 'foto.jpeg', mimeType: 'image/jpeg', buffer: await createPhoto() },
		focalX: '0.5',
		focalY: '0.5',
		zoom: '1',
	};
	const [save, reframe, remove] = await postBlockedActions(request, id, multipart);
	const pdf = await request.get('/secretaria/amigofraterno/pdf?nextDrawDate=2026-08-27');
	await Promise.all([save, reframe, remove].map((response) => assertBlockedAction(response, status, name)));
	expect(pdf.status()).toBe(401);
	expect(await pdf.text()).not.toContain(name);
	await assertPhotoUnchanged(database, name, before);
};

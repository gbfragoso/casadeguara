import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAvisosPageHandlers } from '../../../../../../src/routes/(protected)/biblioteca/avisos/+page.server';

const libraryUser = { roles: 'biblioteca', username: 'bibliotecaria' };

const createRequest = (texto?: string | Blob) => {
	const formData = new FormData();
	if (texto !== undefined) formData.set('texto', texto);

	return new Request('http://localhost', { method: 'POST', body: formData });
};

describe('notice creation failures', () => {
	afterEach(() => vi.restoreAllMocks());

	it.each([
		['missing text', undefined, ''],
		['non-textual text', new Blob(['notice']), ''],
		['blank text', '   ', '   '],
		['text exceeding the limit', 'a'.repeat(301), 'a'.repeat(301)],
	])('returns a validation failure for %s without creating', async (_, texto, preservedText) => {
		const model = { create: vi.fn(), listRecent: vi.fn() };

		await expect(
			createAvisosPageHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest(texto),
			}),
		).resolves.toMatchObject({ status: 400, data: { values: { texto: preservedText } } });
		expect(model.create).not.toHaveBeenCalled();
	});

	it('redirects direct unauthenticated creation before reading the form', async () => {
		const request = createRequest('Aviso');
		const formDataSpy = vi.spyOn(request, 'formData');
		const model = { create: vi.fn(), listRecent: vi.fn() };

		await expect(
			createAvisosPageHandlers(model).actions.default({ locals: { user: null }, request }),
		).rejects.toMatchObject({ status: 302 });
		expect(formDataSpy).not.toHaveBeenCalled();
		expect(model.create).not.toHaveBeenCalled();
	});

	it('translates a creation persistence failure to an internal error', async () => {
		const model = { create: vi.fn().mockRejectedValue(new Error('database unavailable')), listRecent: vi.fn() };
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			createAvisosPageHandlers(model).actions.default({
				locals: { user: libraryUser },
				request: createRequest('Aviso'),
			}),
		).rejects.toMatchObject({ status: 500, body: { message: 'Falha ao criar um novo aviso' } });
		expect(errorSpy).toHaveBeenCalledOnce();
	});
});

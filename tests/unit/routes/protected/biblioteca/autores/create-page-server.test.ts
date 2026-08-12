import { _createNewAuthorHandlers } from '../../../../../../src/routes/(protected)/biblioteca/autores/novo/+page.server';
import { afterEach, describe, expect, it, vi } from 'vitest';

function formRequest(nome?: FormDataEntryValue) {
	const form = new FormData();
	if (nome !== undefined) form.set('nome', nome);
	return new Request('http://localhost/biblioteca/autores/novo', { method: 'POST', body: form });
}

afterEach(() => vi.restoreAllMocks());

describe('new author page handlers', () => {
	it('redirects an unauthenticated visitor', async () => {
		const handlers = _createNewAuthorHandlers({ create: async () => undefined });

		await expect(handlers.load({ locals: { user: null } })).rejects.toMatchObject({ status: 302, location: '/' });
	});

	it('creates a normalized valid name', async () => {
		const create = vi.fn(async () => undefined);
		const handlers = _createNewAuthorHandlers({ create });

		const result = await handlers.actions.default({ request: formRequest(' Érico Veríssimo ') });

		expect(create).toHaveBeenCalledWith('ÉRICO VERÍSSIMO');
		expect(result).toEqual({ status: 201 });
	});

	it('preserves invalid values without creating an author', async () => {
		const create = vi.fn(async () => undefined);
		const handlers = _createNewAuthorHandlers({ create });

		const result = await handlers.actions.default({ request: formRequest('   ') });

		expect(create).not.toHaveBeenCalled();
		expect(result).toEqual({
			status: 400,
			data: { values: { nome: '   ' }, errors: { nome: ['Nome do autor é obrigatório.'] } },
		});
	});

	it('translates database failures to a server error', async () => {
		const handlers = _createNewAuthorHandlers({ create: async () => Promise.reject(new Error('database')) });
		vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(handlers.actions.default({ request: formRequest('Érico') })).rejects.toMatchObject({
			status: 500,
		});
	});
});

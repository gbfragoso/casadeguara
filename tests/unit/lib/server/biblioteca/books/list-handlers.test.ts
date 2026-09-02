import { describe, expect, it, vi } from 'vitest';

import { createBookListHandlers } from '$lib/server/biblioteca/books/list-handlers';
import { LivroHasDependentsError, LivroNotFoundError } from '$lib/server/models/livro-error';

type ListModel = Parameters<typeof createBookListHandlers>[0]['model'];

const user = { roles: 'biblioteca' };
const admin = { roles: 'biblioteca:admin' };

const createEvent = (currentUser: typeof user | null, form: FormData = new FormData()) => ({
	locals: { user: currentUser },
	request: new Request('http://localhost/', { method: 'POST', body: form }),
});

const createModel = (overrides: Partial<ListModel> = {}): ListModel => ({
	listCollectionOptions: vi.fn().mockResolvedValue([]),
	search: vi.fn().mockResolvedValue([]),
	delete: vi.fn().mockResolvedValue(undefined),
	...overrides,
});

describe('createBookListHandlers', () => {
	it('loads collections and exposes the exact administrative flag', async () => {
		const model = createModel({
			listCollectionOptions: vi.fn().mockResolvedValue([{ idserie: 4, nome: 'Coleção' }]),
		});
		const result = await createBookListHandlers({ model }).load({ locals: { user: admin } });

		expect(result).toEqual({
			colecoes: [{ idserie: 4, nome: 'Coleção' }],
			isAdmin: true,
			role: admin.roles,
		});
	});

	it('sanitizes an unexpected collection load failure', async () => {
		const model = createModel({ listCollectionOptions: vi.fn().mockRejectedValue(new Error('driver secret')) });

		await expect(createBookListHandlers({ model }).load({ locals: { user } })).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao carregar os dados dos livros.' },
		});
	});

	it('authorizes before consuming a search request', async () => {
		const model = createModel();
		const requireAccess = vi.fn(() => {
			throw new Error('unauthorized');
		});
		const event = createEvent(user);
		const readRequest = vi.spyOn(event.request, 'formData');
		const handlers = createBookListHandlers({ model, requireAccess });

		await expect(handlers.actions.pesquisar(event)).rejects.toThrow('unauthorized');

		expect(readRequest).not.toHaveBeenCalled();
		expect(model.search).not.toHaveBeenCalled();
	});

	it('rejects a delete before consuming the request when admin access fails', async () => {
		const model = createModel();
		const requireAdminAccess = vi.fn(() => {
			throw new Error('forbidden');
		});
		const event = createEvent(user);
		const readRequest = vi.spyOn(event.request, 'formData');
		const handlers = createBookListHandlers({ model, requireAdminAccess });

		await expect(handlers.actions.excluir(event)).rejects.toThrow('forbidden');

		expect(readRequest).not.toHaveBeenCalled();
		expect(model.delete).not.toHaveBeenCalled();
	});

	it('returns all search field errors and safe submitted values', async () => {
		const form = new FormData();
		form.set('tombo', 'abc');
		form.set('titulo', 'x'.repeat(81));
		form.set('colecaoId', '0');
		form.set('unexpected', 'discarded');
		const model = createModel();
		const handlers = createBookListHandlers({ model });

		const result = await handlers.actions.pesquisar(createEvent(user, form));

		expect(result).toMatchObject({
			status: 400,
			data: {
				values: {
					tombo: 'abc',
					titulo: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
				},
				errors: { tombo: expect.any(Array), titulo: expect.any(Array), colecao: expect.any(Array) },
			},
		});
		if (!('data' in result)) throw new Error('Expected a validation failure.');
		expect(result.data.values).not.toHaveProperty('unexpected');
		expect(model.search).not.toHaveBeenCalled();
	});

	it('sanitizes an unexpected search failure', async () => {
		const model = createModel({ search: vi.fn().mockRejectedValue(new Error('driver secret')) });
		const form = new FormData();
		form.set('titulo', 'Livro');

		await expect(
			createBookListHandlers({ model }).actions.pesquisar(createEvent(user, form)),
		).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao carregar a lista de livros.' },
		});
	});

	it('maps delete validation, missing books, dependents and unexpected failures', async () => {
		const invalid = createBookListHandlers({ model: createModel() });
		const invalidForm = new FormData();
		invalidForm.set('idlivro', 'abc');
		const invalidResult = await invalid.actions.excluir(createEvent(admin, invalidForm));

		const missingModel = createModel({ delete: vi.fn().mockRejectedValue(new LivroNotFoundError()) });
		const missingForm = new FormData();
		missingForm.set('idlivro', '4');
		const missingResult = await createBookListHandlers({ model: missingModel }).actions.excluir(
			createEvent(admin, missingForm),
		);

		const dependentModel = createModel({ delete: vi.fn().mockRejectedValue(new LivroHasDependentsError()) });
		const dependentResult = await createBookListHandlers({ model: dependentModel }).actions.excluir(
			createEvent(admin, missingForm),
		);

		expect(invalidResult).toMatchObject({ status: 400, data: { values: { idlivro: 'abc' } } });
		expect(missingResult).toMatchObject({ status: 404, data: { message: expect.any(String) } });
		expect(dependentResult).toMatchObject({ status: 409, data: { message: expect.any(String) } });
	});

	it('sanitizes an unexpected delete failure as an internal error', async () => {
		const model = createModel({ delete: vi.fn().mockRejectedValue(new Error('driver secret')) });
		const handlers = createBookListHandlers({ model });
		const form = new FormData();
		form.set('idlivro', '4');

		await expect(handlers.actions.excluir(createEvent(admin, form))).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao excluir o livro.' },
		});
	});
});

import { describe, expect, it, vi } from 'vitest';

import { createBookCreateHandlers } from '$lib/server/biblioteca/books/create-handlers';
import { DuplicateLivroTomboError, LivroReferenceNotFoundError } from '$lib/server/models/livro-error';

type CreateModel = Parameters<typeof createBookCreateHandlers>[0]['model'];

const user = { roles: 'biblioteca' };

const createEvent = (form: FormData = new FormData()) => ({
	locals: { user },
	request: new Request('http://localhost/', { method: 'POST', body: form }),
});

const createForm = (overrides: Record<string, string> = {}) => {
	const form = new FormData();
	form.set('tombo', '000123');
	form.set('titulo', 'Tenda dos Milagres');
	form.set('editora', '12');
	form.append('autores', '5');
	Object.entries(overrides).forEach(([field, value]) => form.set(field, value));
	return form;
};

const createModel = (overrides: Partial<CreateModel> = {}): CreateModel => ({
	listPublisherOptions: vi.fn().mockResolvedValue([]),
	listCollectionOptions: vi.fn().mockResolvedValue([]),
	listAuthorOptions: vi.fn().mockResolvedValue([]),
	create: vi.fn().mockResolvedValue({ idlivro: 9 }),
	...overrides,
});

describe('createBookCreateHandlers', () => {
	it('loads complete catalog options after authorization', async () => {
		const model = createModel({
			listPublisherOptions: vi.fn().mockResolvedValue([{ ideditora: 2, nome: 'Editora' }]),
			listCollectionOptions: vi.fn().mockResolvedValue([{ idserie: 3, nome: 'Coleção' }]),
			listAuthorOptions: vi.fn().mockResolvedValue([{ idautor: 5, nome: 'Autor' }]),
		});

		await expect(createBookCreateHandlers({ model }).load({ locals: { user } })).resolves.toEqual({
			editoras: [{ ideditora: 2, nome: 'Editora' }],
			colecoes: [{ idserie: 3, nome: 'Coleção' }],
			autores: [{ idautor: 5, nome: 'Autor' }],
		});
	});

	it('sanitizes an unexpected options load failure', async () => {
		const model = createModel({ listPublisherOptions: vi.fn().mockRejectedValue(new Error('driver secret')) });

		await expect(createBookCreateHandlers({ model }).load({ locals: { user } })).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao carregar os dados do livro.' },
		});
	});

	it('authorizes before consuming a create request', async () => {
		const model = createModel();
		const requireAccess = vi.fn(() => {
			throw new Error('unauthorized');
		});
		const event = createEvent(createForm());
		const readRequest = vi.spyOn(event.request, 'formData');
		const handlers = createBookCreateHandlers({ model, requireAccess });

		await expect(handlers.actions.default(event)).rejects.toThrow('unauthorized');

		expect(readRequest).not.toHaveBeenCalled();
		expect(model.create).not.toHaveBeenCalled();
	});

	it('returns every create validation error with safe values', async () => {
		const model = createModel();
		const form = createForm({ tombo: 'abc', titulo: '123', editora: '0', ordem: '2' });
		const result = await createBookCreateHandlers({ model }).actions.default(createEvent(form));

		expect(result).toMatchObject({
			status: 400,
			data: {
				values: { tombo: 'abc', titulo: '123', editora: '0', ordem: '2', colecao: '' },
				errors: {
					tombo: expect.any(Array),
					titulo: expect.any(Array),
					editora: expect.any(Array),
					ordem: expect.any(Array),
				},
			},
		});
		expect(model.create).not.toHaveBeenCalled();
	});

	it('maps known persistence errors to field-safe failures', async () => {
		const duplicate = createBookCreateHandlers({
			model: createModel({ create: vi.fn().mockRejectedValue(new DuplicateLivroTomboError()) }),
		});
		const duplicateResult = await duplicate.actions.default(createEvent(createForm()));

		const reference = createBookCreateHandlers({
			model: createModel({ create: vi.fn().mockRejectedValue(new LivroReferenceNotFoundError('colecao')) }),
		});
		const referenceResult = await reference.actions.default(createEvent(createForm({ colecao: '99' })));

		expect(duplicateResult).toMatchObject({ status: 409, data: { errors: { tombo: [expect.any(String)] } } });
		expect(referenceResult).toMatchObject({ status: 400, data: { errors: { colecao: [expect.any(String)] } } });
	});

	it('returns the created identifier and public success message', async () => {
		const model = createModel();
		const result = await createBookCreateHandlers({ model }).actions.default(createEvent(createForm()));

		expect(result).toEqual({ outcome: 'created', idlivro: 9, message: 'Livro cadastrado com sucesso.' });
		expect(model.create).toHaveBeenCalledWith({
			tombo: '000123',
			titulo: 'Tenda dos Milagres',
			editoraId: 12,
			autorIds: [5],
			novoAutor: undefined,
		});
	});

	it('sanitizes an unexpected create failure as an internal error', async () => {
		const model = createModel({ create: vi.fn().mockRejectedValue(new Error('driver secret')) });

		await expect(
			createBookCreateHandlers({ model }).actions.default(createEvent(createForm())),
		).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao cadastrar um novo livro.' },
		});
	});
});

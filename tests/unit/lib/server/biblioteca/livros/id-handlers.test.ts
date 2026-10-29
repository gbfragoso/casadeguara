import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaLivrosIdIntegerHandlers } = await import('#lib/server/biblioteca/livros/id-handlers.js');

const { load, actions } = createBibliotecaLivrosIdIntegerHandlers();
const librarian = { roles: 'biblioteca', params: { id: '3' } };
const bookForm = { tombo: '100', titulo: 'Nosso Lar', editora: '2', colecao: '', ordem: '' };

const failingDatabase = () => {
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
	fakeDatabase.failWith(new Error('database offline'));
};

afterEach(() => {
	fakeDatabase.reset();
	vi.restoreAllMocks();
});

describe('createBibliotecaLivrosIdIntegerHandlers load', () => {
	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(load, { params: { id: '3' } });

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('rejects a user without library access', async () => {
		const { error } = await expectHttpError(load, { roles: 'secretaria', params: { id: '3' } });

		expect(error.status).toBe(401);
	});

	it('returns the book with publishers and collections', async () => {
		fakeDatabase.resolveWith([{ idlivro: 3 }]);

		const { result } = await runHandler(load, librarian);

		expect(result).toEqual({ livro: { idlivro: 3 }, editoras: [{ idlivro: 3 }], colecoes: [{ idlivro: 3 }] });
	});

	it('responds 404 when the book does not exist', async () => {
		fakeDatabase.resolveWith([]);

		const { error } = await expectHttpError(load, librarian);

		expect(error.status).toBe(404);
	});

	it('fails when the book cannot be read', async () => {
		failingDatabase();

		const { error } = await expectHttpError(load, librarian);

		expect(error.status).toBe(500);
	});
});

describe('createBibliotecaLivrosIdIntegerHandlers default action', () => {
	it('rejects a user without library access before reading the form', async () => {
		const { event, error } = await expectHttpError(actions.default, {
			roles: 'secretaria',
			form: bookForm,
			params: { id: '3' },
		});

		expect(error.status).toBe(401);
		expect(event.request.bodyUsed).toBe(false);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it.each([
		['an empty title', { titulo: ' ' }, 'Título da obra é obrigatório'],
		['a numeric title', { titulo: '123' }, 'Título da obra não pode conter somente números'],
		['a missing publisher', { editora: '' }, 'Editora da obra é obrigatório'],
	])('rejects %s', async (_scenario, override, message) => {
		const { result } = await runHandler(actions.default, { ...librarian, form: { ...bookForm, ...override } });

		expect(result).toMatchObject({ status: 400, message });
	});

	it.each([
		['without a collection', {}, { serie: null, ordem: null }],
		['within a collection', { colecao: '5', ordem: '2' }, { serie: 5, ordem: 2 }],
	])('updates the book %s', async (_scenario, override, collection) => {
		const { result } = await runHandler(actions.default, { ...librarian, form: { ...bookForm, ...override } });

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.argumentsOf('set')).toEqual([
			{ tombo: '100', titulo: 'Nosso Lar', editora: 2, ...collection },
		]);
	});

	it('fails when the book cannot be updated', async () => {
		failingDatabase();

		const { error } = await expectHttpError(actions.default, { ...librarian, form: bookForm });

		expect(error.status).toBe(500);
	});
});

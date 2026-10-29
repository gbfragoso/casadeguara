import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';
import { describeLibraryAdminFlag } from '../../../../support/library-admin-flag-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaLivrosIdIntegerExemplaresHandlers } =
	await import('#lib/server/biblioteca/livros/id-exemplares-handlers.js');

const { load, actions } = createBibliotecaLivrosIdIntegerExemplaresHandlers();
const params = { id: '3' };
const librarian = { roles: 'biblioteca', params };
const administrator = { roles: 'biblioteca,biblioteca:admin', params };
const copyUrl = 'http://localhost/?exemplar=11';

const failingDatabase = () => {
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
	fakeDatabase.failWith(new Error('database offline'));
};

afterEach(() => {
	fakeDatabase.reset();
	vi.restoreAllMocks();
});

describe('createBibliotecaLivrosIdIntegerExemplaresHandlers load', () => {
	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(load, { params });

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('rejects a user without library access', async () => {
		const { error } = await expectHttpError(load, { roles: 'secretaria', params });

		expect(error.status).toBe(401);
	});

	it('streams the book copies', async () => {
		fakeDatabase.resolveWith([{ idexemplar: 11 }]);

		const { result } = await runHandler(load, librarian);

		await expect((result as { exemplares: Promise<unknown> }).exemplares).resolves.toEqual([{ idexemplar: 11 }]);
	});

	describeLibraryAdminFlag(() => load, params);
});

describe('createBibliotecaLivrosIdIntegerExemplaresHandlers adicionar', () => {
	it('rejects a user without library access before reading the form', async () => {
		const { event, error } = await expectHttpError(actions.adicionar, {
			roles: 'secretaria',
			form: { numero: '2' },
			params,
		});

		expect(error.status).toBe(401);
		expect(event.request.bodyUsed).toBe(false);
	});

	it('registers an available copy for the book', async () => {
		const { result } = await runHandler(actions.adicionar, { ...librarian, form: { numero: '2' } });

		expect(result).toEqual({ status: 201 });
		expect(fakeDatabase.argumentsOf('values')).toEqual([
			{ livro: 3, numero: 2, status: 'Disponível', dataCadastro: expect.any(Date) },
		]);
	});

	it('fails when the copy cannot be registered', async () => {
		failingDatabase();

		const { error } = await expectHttpError(actions.adicionar, { ...librarian, form: { numero: '2' } });

		expect(error.status).toBe(500);
	});
});

describe.each([
	['disponivel', 'update', { status: 'Disponível' }],
	['arquivar', 'update', { status: 'Arquivado' }],
	['excluir', 'delete', undefined],
] as const)('createBibliotecaLivrosIdIntegerExemplaresHandlers %s', (name, operation, change) => {
	const action = actions[name];

	it('rejects a non-administrator', async () => {
		const { error } = await expectHttpError(action, { ...librarian, url: copyUrl });

		expect(error.status).toBe(401);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('requires the copy', async () => {
		const { result } = await runHandler(action, administrator);

		expect(result).toMatchObject({ status: 400 });
	});

	it('changes the copy for an administrator', async () => {
		const { result } = await runHandler(action, { ...administrator, url: copyUrl });

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.queries()).toMatchObject([{ operation }]);
		expect(fakeDatabase.argumentsOf('set')).toEqual(change && [change]);
	});

	it('fails when the copy cannot be changed', async () => {
		failingDatabase();

		const { error } = await expectHttpError(action, { ...administrator, url: copyUrl });

		expect(error.status).toBe(500);
	});
});

import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaEmprestimosIdIntegerHandlers } =
	await import('#lib/server/biblioteca/emprestimos/id-handlers.js');

const { load, actions } = createBibliotecaEmprestimosIdIntegerHandlers();
const librarian = { roles: 'biblioteca', params: { id: '7' } };
const loan = { leitor: 'João', livro: 'Nosso Lar', idlivro: 3, idexemplar: 11 };
const swapForm = { idexemplar: '11', novoexemplar: '12' };

const failingDatabase = () => {
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
	fakeDatabase.failWith(new Error('database offline'));
};

afterEach(() => {
	fakeDatabase.reset();
	vi.restoreAllMocks();
});

describe('createBibliotecaEmprestimosIdIntegerHandlers load', () => {
	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(load, { params: { id: '7' } });

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('rejects a user without library access', async () => {
		const { error } = await expectHttpError(load, { roles: 'secretaria', params: { id: '7' } });

		expect(error.status).toBe(401);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('returns the loan to a librarian', async () => {
		fakeDatabase.resolveWith([loan]);

		const { result } = await runHandler(load, librarian);

		expect(result).toMatchObject({ emprestimo: loan });
	});

	it('responds 404 when the loan does not exist', async () => {
		fakeDatabase.resolveWith([]);

		const { error } = await expectHttpError(load, librarian);

		expect(error.status).toBe(404);
	});

	it('fails when the loan cannot be read', async () => {
		failingDatabase();

		const { error } = await expectHttpError(load, librarian);

		expect(error.status).toBe(500);
	});
});

describe('createBibliotecaEmprestimosIdIntegerHandlers default action', () => {
	it('rejects a user without library access before reading the form', async () => {
		const { event, error } = await expectHttpError(actions.default, {
			roles: 'tesouraria',
			form: swapForm,
			params: { id: '7' },
		});

		expect(error.status).toBe(401);
		expect(event.request.bodyUsed).toBe(false);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('requires a replacement copy', async () => {
		const { result } = await runHandler(actions.default, {
			...librarian,
			form: { ...swapForm, novoexemplar: ' ' },
		});

		expect(result).toMatchObject({ status: 400, message: 'Selecione um exemplar para trocar' });
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('swaps the loaned copy and updates both copy statuses', async () => {
		const { result } = await runHandler(actions.default, { ...librarian, form: swapForm });

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.queries().map((query) => query.calls[1].args[0])).toEqual([
			{ exemplar: 12 },
			{ status: 'Disponível' },
			{ status: 'Emprestado' },
		]);
	});

	it('fails when the loan cannot be updated', async () => {
		failingDatabase();

		const { error } = await expectHttpError(actions.default, { ...librarian, form: swapForm });

		expect(error.status).toBe(500);
	});
});

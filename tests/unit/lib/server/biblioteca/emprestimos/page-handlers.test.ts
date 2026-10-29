import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaEmprestimosHandlers } = await import('#lib/server/biblioteca/emprestimos/page-handlers.js');

const { load, actions } = createBibliotecaEmprestimosHandlers();
const librarian = { roles: 'biblioteca' };
const loans = [{ idemp: 7, leitor: 'João', titulo: 'Nosso Lar' }];

afterEach(() => {
	fakeDatabase.reset();
	vi.restoreAllMocks();
});

describe('createBibliotecaEmprestimosHandlers load', () => {
	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(load);

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('rejects a user without library access', async () => {
		const { error } = await expectHttpError(load, { roles: 'secretaria' });

		expect(error.status).toBe(401);
	});

	it.each([
		['a librarian', 'biblioteca', false],
		['a library administrator', 'biblioteca,biblioteca:admin', true],
	])('tells whether %s administers the library', async (_user, roles, isAdmin) => {
		const { result } = await runHandler(load, { roles });

		expect(result).toEqual({ isAdmin });
	});
});

describe('createBibliotecaEmprestimosHandlers default action', () => {
	it('rejects a user without library access before reading the form', async () => {
		const { event, error } = await expectHttpError(actions.default, {
			roles: 'secretaria',
			form: { leitor: 'Jo' },
		});

		expect(error.status).toBe(401);
		expect(event.request.bodyUsed).toBe(false);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it.each([
		['without filters', {}],
		['filtered by every criterion', { leitor: 'Jo', titulo: 'Nosso', tombo: '100', atrasados: 'on', ativos: 'on' }],
	])('lists loans %s', async (_scenario, form) => {
		fakeDatabase.resolveWith(loans);

		const { result } = await runHandler(actions.default, { ...librarian, form });

		expect(result).toEqual({ emprestimos: loans, status: 200, message: 'OK' });
	});

	it('fails when the loans cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fakeDatabase.failWith(new Error('database offline'));

		const { error } = await expectHttpError(actions.default, librarian);

		expect(error.status).toBe(500);
	});
});

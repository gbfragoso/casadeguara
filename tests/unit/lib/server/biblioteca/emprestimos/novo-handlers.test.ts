import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';

const loans = vi.hoisted(() => ({
	listReaders: vi.fn(async () => [{ idleitor: 1, nome: 'João' }]),
	listCopies: vi.fn(async () => [{ idexemplar: 11 }]),
	rejectLoan: vi.fn((field: string, message: string) => ({ status: 400, field, message })),
	validateReader: vi.fn(async (): Promise<unknown> => undefined),
	recordLoan: vi.fn(async () => 7),
}));

vi.mock('#lib/server/biblioteca/loans/create.js', () => loans);

const { createBibliotecaEmprestimosNovoHandlers } = await import('#lib/server/biblioteca/emprestimos/novo-handlers.js');

const { load, actions } = createBibliotecaEmprestimosNovoHandlers();
const loanForm = { leitorid: '1', exemplarid: '11' };

afterEach(() => {
	vi.clearAllMocks();
	vi.restoreAllMocks();
});

describe('createBibliotecaEmprestimosNovoHandlers load', () => {
	it('rejects a user without library access', async () => {
		const { error } = await expectHttpError(load, { roles: 'secretaria' });

		expect(error.status).toBe(401);
		expect(loans.listReaders).not.toHaveBeenCalled();
	});

	it('lists readers and copies for a librarian', async () => {
		const { result } = await runHandler(load, { roles: 'biblioteca' });

		expect(result).toEqual({ leitores: [{ idleitor: 1, nome: 'João' }], exemplares: [{ idexemplar: 11 }] });
	});

	it('fails when the loan options cannot be read', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		loans.listReaders.mockRejectedValueOnce(new Error('database offline'));

		const { error } = await expectHttpError(load, { roles: 'biblioteca' });

		expect(error.status).toBe(500);
	});
});

describe('createBibliotecaEmprestimosNovoHandlers default action', () => {
	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(actions.default, { form: loanForm });

		expect(redirect).toMatchObject({ status: 302, location: '/' });
	});

	it('rejects a user without library access before recording the loan', async () => {
		const { event, error } = await expectHttpError(actions.default, { roles: 'secretaria', form: loanForm });

		expect(error.status).toBe(401);
		expect(event.request.bodyUsed).toBe(false);
		expect(loans.recordLoan).not.toHaveBeenCalled();
	});

	it.each([
		['reader', { exemplarid: '11' }, 'leitor'],
		['copy', { leitorid: '1' }, 'exemplar'],
	])('requires the %s', async (_missing, form, field) => {
		const { result } = await runHandler(actions.default, { roles: 'biblioteca', form });

		expect(result).toMatchObject({ status: 400, field });
	});

	it.each([
		['a library administrator', 'biblioteca:admin', true],
		['a librarian who administers another area', 'biblioteca,tesouraria:admin', false],
	])('validates the reader as %s', async (_viewer, roles, isAdmin) => {
		await expectRedirect(actions.default, { roles, form: loanForm });

		expect(loans.validateReader).toHaveBeenCalledWith(1, isAdmin);
	});

	it('returns the reader rejection without recording the loan', async () => {
		loans.validateReader.mockResolvedValueOnce({ status: 400, field: 'leitor', message: 'Leitor suspenso' });

		const { result } = await runHandler(actions.default, { roles: 'biblioteca', form: loanForm });

		expect(result).toMatchObject({ message: 'Leitor suspenso' });
		expect(loans.recordLoan).not.toHaveBeenCalled();
	});

	it('records the loan for the librarian and opens its receipt with a print request', async () => {
		const { redirect } = await expectRedirect(actions.default, {
			roles: 'biblioteca',
			userId: 'user-3',
			form: loanForm,
		});

		expect(loans.recordLoan).toHaveBeenCalledWith(1, 11, 'user-3');
		expect(redirect).toMatchObject({ status: 302, location: '/biblioteca/emprestimos/7/recibo?imprimir=1' });
	});
});

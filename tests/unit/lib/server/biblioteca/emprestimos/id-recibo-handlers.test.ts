import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createBibliotecaEmprestimosIdIntegerReciboHandlers } from '#lib/server/biblioteca/emprestimos/id-recibo-handlers.js';
import type { ReciboEmprestimo } from '#lib/receipts/loan-receipt.js';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';

const recibo: ReciboEmprestimo = {
	idemp: 7,
	leitor: 'Maria da Conceição Souza',
	tombo: '0457',
	titulo: 'O Livro dos Espíritos',
	exemplar: 2,
	dataEmprestimo: '01/10/2026',
	dataDevolucao: '15/10/2026',
};
const librarian = { roles: 'biblioteca', params: { id: '7' } };

const createInMemoryModel = (receipts: ReciboEmprestimo[] = [recibo]) => ({
	findReceipt: vi.fn(async (id: number) => receipts.find((receipt) => receipt.idemp === id)),
});

const createLoad = (model = createInMemoryModel()) =>
	createBibliotecaEmprestimosIdIntegerReciboHandlers({ model }).load;

afterEach(() => {
	vi.restoreAllMocks();
});

describe('createBibliotecaEmprestimosIdIntegerReciboHandlers load', () => {
	it('redirects an anonymous visitor without reading the receipt', async () => {
		const model = createInMemoryModel();

		const { redirect } = await expectRedirect(createLoad(model), { params: { id: '7' } });

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
		expect(model.findReceipt).not.toHaveBeenCalled();
	});

	it('rejects a user without library access before reading the receipt', async () => {
		const model = createInMemoryModel();

		const { error } = await expectHttpError(createLoad(model), { roles: 'secretaria', params: { id: '7' } });

		expect(error.status).toBe(401);
		expect(model.findReceipt).not.toHaveBeenCalled();
	});

	it('returns the receipt of the numeric id to a librarian', async () => {
		const model = createInMemoryModel();

		const { result } = await runHandler(createLoad(model), librarian);

		expect(result).toEqual({ recibo });
		expect(model.findReceipt).toHaveBeenCalledWith(7);
	});

	it('responds 404 when the loan does not exist', async () => {
		const load = createLoad(createInMemoryModel([]));

		const { error } = await expectHttpError(load, librarian);

		expect(error).toMatchObject({ status: 404, body: { message: 'Empréstimo não encontrado' } });
	});

	it('translates a read failure into 500 and logs its cause', async () => {
		const cause = new Error('database offline');
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const load = createLoad({ findReceipt: vi.fn().mockRejectedValue(cause) });

		const { error } = await expectHttpError(load, librarian);

		expect(error).toMatchObject({ status: 500, body: { message: 'Falha ao carregar os dados do empréstimo' } });
		expect(log).toHaveBeenCalledWith('Falha ao carregar os dados do empréstimo', { cause });
	});
});

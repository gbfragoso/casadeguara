import { afterEach, describe, expect, it, vi } from 'vitest';

import { LancamentoError, lancamentoModel } from '$lib/server/tesouraria/lancamentos';
import { load as dashboardLoad } from '../../../../../src/routes/(protected)/tesouraria/+page.server';
import {
	actions as cashActions,
	load as cashLoad,
} from '../../../../../src/routes/(protected)/tesouraria/caixa/+page.server';
import { createRequestEvent, invoke, type TestUser } from '../../../support/request-event';

const user: TestUser = { id: 'cash-user', roles: 'tesouraria', username: 'cash', name: 'Cash' };
const admin: TestUser = { ...user, id: 'cash-admin', roles: 'tesouraria:admin' };

const formEvent = (form: FormData, currentUser = user) =>
	createRequestEvent({
		locals: { user: currentUser, session: null },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});

describe('financial consumer route adapters', () => {
	afterEach(() => vi.restoreAllMocks());

	it('loads dashboard projections from the unified model', async () => {
		vi.spyOn(lancamentoModel, 'getDashboard').mockResolvedValue({
			entradaMesAtual: { count: 2, median: 10, value: '20.00' },
			saidaMesAtual: { value: '5.00' },
		});

		const result = await invoke(dashboardLoad, createRequestEvent({ locals: { user, session: null } }));

		expect(result).toEqual({
			entradaMesAtual: [{ count: 2, median: 10, value: '20.00' }],
			saidaMesAtual: [{ value: '5.00' }],
		});
	});

	it('maps dashboard failures to a safe server error', async () => {
		vi.spyOn(lancamentoModel, 'getDashboard').mockRejectedValue(new Error('database secret'));

		await expect(
			invoke(dashboardLoad, createRequestEvent({ locals: { user, session: null } })),
		).rejects.toMatchObject({
			status: 500,
		});
	});

	it('lists pending cash entries and confirms validated IDs through the model', async () => {
		vi.spyOn(lancamentoModel, 'listPendingDeposits').mockResolvedValue([]);
		const confirmDeposits = vi.spyOn(lancamentoModel, 'confirmDeposits').mockResolvedValue(undefined);
		const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
		const form = new FormData();
		form.append('entradas', '9');
		form.append('entradas', '9');

		const list = await invoke(cashLoad, createRequestEvent({ locals: { user: admin, session: null } }));
		const result = await invoke(cashActions.default, formEvent(form, admin));

		expect(list).toEqual({ entradas: [] });
		expect(result).toMatchObject({ status: 201 });
		expect(confirmDeposits).toHaveBeenCalledWith([9], admin.id);
		expect(info).toHaveBeenCalledWith('treasury.launches.deposits_confirmed', { ids: [9], userId: admin.id });
		info.mockRestore();
	});

	it('rejects invalid cash IDs and maps deposit conflicts without mutation', async () => {
		const confirmDeposits = vi.spyOn(lancamentoModel, 'confirmDeposits');
		const invalid = new FormData();
		invalid.append('entradas', 'abc');

		const invalidResult = await invoke(cashActions.default, formEvent(invalid, admin));

		confirmDeposits.mockRejectedValue(new LancamentoError('LANCAMENTO_NOT_DEPOSITABLE', 'invalid state'));
		const valid = new FormData();
		valid.append('entradas', '9');
		const conflict = await invoke(cashActions.default, formEvent(valid, admin));

		expect(invalidResult).toMatchObject({ status: 400 });
		expect(conflict).toMatchObject({ status: 409 });
	});

	it('maps cash loading and confirmation failures to safe server errors', async () => {
		vi.spyOn(lancamentoModel, 'listPendingDeposits').mockRejectedValue(new Error('database secret'));
		await expect(
			invoke(cashLoad, createRequestEvent({ locals: { user: admin, session: null } })),
		).rejects.toMatchObject({
			status: 500,
		});

		vi.spyOn(lancamentoModel, 'confirmDeposits').mockRejectedValue(new Error('database secret'));
		const form = new FormData();
		form.set('entradas', '9');
		await expect(invoke(cashActions.default, formEvent(form, admin))).rejects.toMatchObject({ status: 500 });
	});
});

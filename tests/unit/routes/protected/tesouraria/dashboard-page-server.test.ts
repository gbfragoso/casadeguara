import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	requireAccess: vi.fn(),
	getDashboard: vi.fn(),
	getMonthlyTotals: vi.fn(),
}));

vi.mock('$lib/server/authorization/tesouraria', () => ({
	requireTesourariaAccess: mocks.requireAccess,
}));
vi.mock('$lib/server/tesouraria/lancamentos', () => ({
	lancamentoModel: {
		getDashboard: mocks.getDashboard,
		getMonthlyTotals: mocks.getMonthlyTotals,
	},
}));

import { load as dashboardLoad } from '../../../../../src/routes/(protected)/tesouraria/+page.server';

const user = { id: 'dashboard-user', roles: 'tesouraria', username: 'dashboard', name: 'Dashboard' };
const event = { locals: { user } } as unknown as Parameters<typeof dashboardLoad>[0];

describe('tesouraria dashboard server load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireAccess.mockImplementation((authorizedUser) => authorizedUser);
		mocks.getDashboard.mockResolvedValue({
			entradaMesAtual: { count: 3, median: 40, value: '120.00' },
			saidaMesAtual: { value: '30.00' },
		});
		mocks.getMonthlyTotals.mockResolvedValue([{ competencia: '2025-10', entradas: '120.00', saidas: '30.00' }]);
	});

	afterEach(() => vi.restoreAllMocks());

	it('authorizes first and shares one reference between parallel projections', async () => {
		const result = await dashboardLoad(event);
		const reference = mocks.getDashboard.mock.calls[0][0];

		expect(mocks.requireAccess).toHaveBeenCalledWith(user);
		expect(mocks.getDashboard).toHaveBeenCalledOnce();
		expect(mocks.getMonthlyTotals).toHaveBeenCalledOnce();
		expect(mocks.getMonthlyTotals.mock.calls[0][0]).toBe(reference);
		expect(result).toEqual({
			entradaMesAtual: [{ count: 3, median: 40, value: '120.00' }],
			saidaMesAtual: [{ value: '30.00' }],
			lancamentosMensais: [{ competencia: '2025-10', entradas: '120.00', saidas: '30.00' }],
		});
	});

	it('does not read projections when authorization rejects the request', async () => {
		const accessError = { status: 403 };
		mocks.requireAccess.mockImplementation(() => {
			throw accessError;
		});

		await expect(dashboardLoad(event)).rejects.toBe(accessError);

		expect(mocks.getDashboard).not.toHaveBeenCalled();
		expect(mocks.getMonthlyTotals).not.toHaveBeenCalled();
	});

	it('maps either projection failure to the existing safe server error', async () => {
		mocks.getMonthlyTotals.mockRejectedValue(new Error('database secret'));
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(dashboardLoad(event)).rejects.toMatchObject({ status: 500 });

		expect(errorSpy).toHaveBeenCalledWith('treasury.launches.dashboard_failed');
	});
});

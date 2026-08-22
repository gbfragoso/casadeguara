import { describe, expect, it, vi } from 'vitest';

import { _createLibraryDashboardLoad } from '../../../../../src/routes/(protected)/biblioteca/+page.server';

const libraryUser = { id: 'user-1', name: 'Bibliotecária', roles: 'biblioteca', username: 'bibliotecaria' };
const notices = [{ idaviso: 5, dataCadastro: new Date('2026-08-20'), texto: 'Aviso', username: 'bibliotecaria' }];
const loans = [{ counter: 4, renovacoes: '2' }];
const returns = [{ counter: 3 }];

describe('library dashboard load', () => {
	it('loads all dashboard sources concurrently after authorizing the user', async () => {
		const noticesSource = Promise.withResolvers<typeof notices>();
		const loansSource = Promise.withResolvers<typeof loans>();
		const returnsSource = Promise.withResolvers<typeof returns>();
		const listRecent = vi.fn().mockReturnValue(noticesSource.promise);
		const listLoans = vi.fn().mockReturnValue(loansSource.promise);
		const listReturns = vi.fn().mockReturnValue(returnsSource.promise);
		const load = _createLibraryDashboardLoad({
			listRecent,
			listLoans,
			listReturns,
			now: () => new Date(2026, 7, 22),
		});
		const result = load({ locals: { session: null, user: libraryUser } });

		expect(listRecent).toHaveBeenCalledOnce();
		expect(listLoans).toHaveBeenCalledWith(new Date(2026, 7, 1), new Date(2026, 7, 31));
		expect(listReturns).toHaveBeenCalledWith(new Date(2026, 7, 1), new Date(2026, 7, 31));
		noticesSource.resolve(notices);
		loansSource.resolve(loans);
		returnsSource.resolve(returns);

		await expect(result).resolves.toEqual({
			avisos: notices,
			emprestimos: loans,
			devolucoes: returns,
			username: libraryUser.name,
			userid: libraryUser.id,
		});
	});

	it('does not consult dashboard sources without library access', async () => {
		const listRecent = vi.fn();
		const load = _createLibraryDashboardLoad({
			listRecent,
			listLoans: vi.fn(),
			listReturns: vi.fn(),
			now: vi.fn(),
		});

		await expect(load({ locals: { session: null, user: null } })).rejects.toMatchObject({ status: 302 });
		expect(listRecent).not.toHaveBeenCalled();
	});

	it('returns an internal error when a dashboard source fails', async () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const load = _createLibraryDashboardLoad({
			listRecent: vi.fn().mockRejectedValue(new Error('database unavailable')),
			listLoans: vi.fn().mockResolvedValue(loans),
			listReturns: vi.fn().mockResolvedValue(returns),
			now: () => new Date('2026-08-22'),
		});

		await expect(load({ locals: { session: null, user: libraryUser } })).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao carregar as informações da biblioteca' },
		});
		expect(errorSpy).toHaveBeenCalledOnce();
	});
});

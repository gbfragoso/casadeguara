import { expect, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/database/connection';
import { cadastros, exemplar } from '$lib/server/database/schema';
import { actions } from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/novo/+page.server';
import { bibliotecaUser } from '../../../../support/auth';
import { invoke } from '../../../../support/request-event';
import { it, createLoanEvent, loanValues, readLoans, createExistingLoan } from './create-support';

it('creates the loan, marks the copy borrowed and redirects to its receipt', async ({ loan }) => {
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(new Date('2026-09-05T12:00:00Z'));
	try {
		await expect(invoke(actions.default, createLoanEvent(loanValues(loan)))).rejects.toMatchObject({
			status: 302,
		});
		const [created] = await readLoans(loan);
		const [copy] = await db.select().from(exemplar).where(eq(exemplar.idexemplar, loan.copy.idexemplar));

		expect(created).toMatchObject({
			leitor: loan.reader.idleitor,
			exemplar: loan.copy.idexemplar,
			userEmprestimo: bibliotecaUser.id,
			dataEmprestimo: new Date('2026-09-05'),
			dataDevolucao: new Date('2026-09-19'),
		});
		expect(copy.status).toBe('Emprestado');
	} finally {
		vi.useRealTimers();
	}
});

it('allows borrowing when the previous loan was returned', async ({ loan }) => {
	await createExistingLoan(loan, true);

	await expect(invoke(actions.default, createLoanEvent(loanValues(loan)))).rejects.toMatchObject({ status: 302 });

	expect(await readLoans(loan)).toHaveLength(2);
});

it('preserves the administrator exception for inactive readers with an active loan', async ({ loan }) => {
	await db.update(cadastros).set({ status: false }).where(eq(cadastros.idleitor, loan.reader.idleitor));
	await createExistingLoan(loan);
	const event = createLoanEvent(loanValues(loan), { ...bibliotecaUser, roles: 'biblioteca:admin' });

	await expect(invoke(actions.default, event)).rejects.toMatchObject({
		status: 302,
		location: expect.stringMatching(/^\/biblioteca\/emprestimos\/\d+\/recibo$/),
	});

	expect(await readLoans(loan)).toHaveLength(2);
});

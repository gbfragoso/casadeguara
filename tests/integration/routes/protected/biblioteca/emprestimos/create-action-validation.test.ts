import { expect } from 'vitest';
import { isActionFailure } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/database/connection';
import { cadastros } from '$lib/server/database/schema';
import { actions } from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/novo/+page.server';
import { createRequestEvent, invoke } from '../../../../support/request-event';
import { it, createLoanEvent, loanValues, readLoans, createExistingLoan } from './create-support';

it.each([
	{ name: 'leitorid', field: 'leitor', message: 'Leitor não encontrado' },
	{ name: 'exemplarid', field: 'exemplar', message: 'Exemplar não encontrado' },
])('returns an action failure when $name is missing', async ({ name, field, message }) => {
	const event = createLoanEvent({ leitorid: '1', exemplarid: '1', [name]: '' });

	const result = await invoke(actions.default, event);

	expect(isActionFailure(result)).toBe(true);
	expect(result).toMatchObject({ status: 400, data: { status: 400, field, message } });
});

it('rejects a reader removed after loading the options', async ({ loan }) => {
	await db.delete(cadastros).where(eq(cadastros.idleitor, loan.reader.idleitor));

	const result = await invoke(actions.default, createLoanEvent(loanValues(loan)));

	expect(isActionFailure(result)).toBe(true);
	expect(result).toMatchObject({ status: 400, data: { field: 'leitor', message: 'Leitor não encontrado' } });
	expect(await readLoans(loan)).toEqual([]);
});

it('returns a failure without creating a loan for an inactive reader', async ({ loan }) => {
	await db.update(cadastros).set({ status: false }).where(eq(cadastros.idleitor, loan.reader.idleitor));

	const result = await invoke(actions.default, createLoanEvent(loanValues(loan)));

	expect(isActionFailure(result)).toBe(true);
	expect(result).toMatchObject({ status: 400, data: { field: 'leitor', message: 'Este leitor está inativo' } });
	expect(await readLoans(loan)).toEqual([]);
});

it('returns a failure without creating another active loan', async ({ loan }) => {
	await createExistingLoan(loan);

	const result = await invoke(actions.default, createLoanEvent(loanValues(loan)));

	expect(isActionFailure(result)).toBe(true);
	expect(result).toMatchObject({
		status: 400,
		data: { field: 'leitor', message: 'Este leitor já possui um empréstimo ativo' },
	});
	expect(await readLoans(loan)).toHaveLength(1);
});

it('redirects an anonymous submission', async () => {
	const event = createRequestEvent();

	await expect(invoke(actions.default, event)).rejects.toMatchObject({ status: 302, location: '/' });
});

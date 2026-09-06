import { expect, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/database/connection';
import { exemplar } from '$lib/server/database/schema';
import { load } from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/novo/+page.server';
import { createRequestEvent, invoke } from '../../../../support/request-event';
import { it, createLoanEvent } from './create-support';

it('returns resolved readers with their original accents', async ({ loan }) => {
	const event = createLoanEvent();

	const result = await invoke(load, event);

	expect(result).toMatchObject({
		leitores: expect.arrayContaining([{ idleitor: loan.reader.idleitor, nome: loan.reader.nome }]),
	});
});

it('returns resolved available copies with the original title and identification', async ({ loan }) => {
	const event = createLoanEvent();

	const result = await invoke(load, event);

	expect(result).toMatchObject({
		exemplares: expect.arrayContaining([
			{ idexemplar: loan.copy.idexemplar, numero: 1, titulo: 'Ação e Reação', tombo: loan.book.tombo },
		]),
	});
});

it('does not offer a borrowed copy', async ({ loan }) => {
	await db.update(exemplar).set({ status: 'Emprestado' }).where(eq(exemplar.idexemplar, loan.copy.idexemplar));

	const result = await invoke(load, createLoanEvent());

	expect(result).toMatchObject({
		exemplares: expect.not.arrayContaining([expect.objectContaining({ idexemplar: loan.copy.idexemplar })]),
	});
});

it('rejects the load with a handled error when asynchronous queries fail', async () => {
	const failure = vi.spyOn(db.$client, 'unsafe').mockImplementation(() => {
		throw new Error('database unavailable');
	});
	const log = vi.spyOn(console, 'error').mockImplementation(() => {});
	try {
		await expect(invoke(load, createLoanEvent())).rejects.toMatchObject({
			status: 500,
			body: { message: 'Falha ao carregar os dados para empréstimo' },
		});
	} finally {
		failure.mockRestore();
		log.mockRestore();
	}
});

it('redirects anonymous visitors before loading reader names', async () => {
	const event = createRequestEvent();

	await expect(invoke(load, event)).rejects.toMatchObject({ status: 302, location: '/' });
});

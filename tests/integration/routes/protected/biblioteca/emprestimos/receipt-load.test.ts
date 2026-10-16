import { expect } from 'vitest';
import { load } from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/[id=integer]/recibo/+page.server';
import { bibliotecaUser } from '../../../../support/auth';
import { createRequestEvent, invoke } from '../../../../support/request-event';
import { createDatedLoan, it } from './create-support';

const MISSING_LOAN_ID = '-1';

const createReceiptEvent = (id: string) =>
	createRequestEvent({
		locals: { user: bibliotecaUser, session: null },
		params: { id },
		url: new URL(`http://localhost/biblioteca/emprestimos/${id}/recibo`),
	});

it('returns the loan receipt to a librarian', async ({ loan }) => {
	const { idemp } = await createDatedLoan(loan, {
		dataEmprestimo: new Date('2026-10-01T00:00:00Z'),
		dataDevolucao: new Date('2026-10-15T00:00:00Z'),
	});

	const result = await invoke(load, createReceiptEvent(String(idemp)));

	expect(result).toEqual({
		recibo: {
			idemp,
			leitor: loan.reader.nome,
			tombo: loan.book.tombo,
			titulo: 'Ação e Reação',
			exemplar: 1,
			dataEmprestimo: '01/10/2026',
			dataDevolucao: '15/10/2026',
		},
	});
});

it('responds 404 when the loan does not exist', async () => {
	const event = createReceiptEvent(MISSING_LOAN_ID);

	const loading = invoke(load, event);

	await expect(loading).rejects.toMatchObject({ status: 404, body: { message: 'Empréstimo não encontrado' } });
});

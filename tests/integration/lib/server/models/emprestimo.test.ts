import { describe, expect } from 'vitest';
import { db } from '#lib/server/database/connection.js';
import { EmprestimoModel } from '#lib/server/models/emprestimo.js';
import { POST } from '../../../../../src/routes/(protected)/api/biblioteca/renovacao/+server';
import { bibliotecaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { createDatedLoan, it } from '../../../routes/protected/biblioteca/emprestimos/create-support';

const model = new EmprestimoModel(db);
const LOAN_DATES = {
	dataEmprestimo: new Date('2026-10-01T00:00:00Z'),
	dataDevolucao: new Date('2026-10-15T00:00:00Z'),
};

const renewLoan = (idemp: number) =>
	invoke(
		POST,
		createRequestEvent({
			locals: { user: bibliotecaUser, session: null },
			request: new Request(`http://localhost/api/biblioteca/renovacao?id=${idemp}`, { method: 'POST' }),
			url: new URL(`http://localhost/api/biblioteca/renovacao?id=${idemp}`),
		}),
	);

describe('EmprestimoModel.findReceipt', () => {
	it('reads the loan receipt with civil dates formatted', async ({ loan }) => {
		const { idemp } = await createDatedLoan(loan, LOAN_DATES);

		const receipt = await model.findReceipt(idemp);

		expect(receipt).toEqual({
			idemp,
			leitor: loan.reader.nome,
			tombo: loan.book.tombo,
			titulo: 'Ação e Reação',
			exemplar: 1,
			dataEmprestimo: '01/10/2026',
			dataDevolucao: '15/10/2026',
		});
	});

	it('reflects the renewed return date and keeps the loan date', async ({ loan }) => {
		const { idemp } = await createDatedLoan(loan, LOAN_DATES);
		const response = await renewLoan(idemp);

		const receipt = await model.findReceipt(idemp);

		expect(response.status).toBe(200);
		expect(receipt).toMatchObject({ dataEmprestimo: '01/10/2026', dataDevolucao: '29/10/2026' });
	});

	it('keeps null for missing dates of legacy loans', async ({ loan }) => {
		const { idemp } = await createDatedLoan(loan, { dataEmprestimo: null, dataDevolucao: null });

		const receipt = await model.findReceipt(idemp);

		expect(receipt).toMatchObject({ dataEmprestimo: null, dataDevolucao: null });
	});

	it('returns undefined for a missing loan', async () => {
		const receipt = await model.findReceipt(-1);

		expect(receipt).toBeUndefined();
	});
});

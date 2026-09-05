import { eq, sql } from 'drizzle-orm';
import { test } from 'vitest';
import { db } from '$lib/server/database/connection';
import { cadastros, emprestimo, exemplar, livro } from '$lib/server/database/schema';
import { bibliotecaUser } from '../../../../support/auth';
import { createRequestEvent } from '../../../../support/request-event';
import { createTestName } from '../../../../lib/server/models/cadastro/test-support';

const createLoanFixture = async () => {
	const [reader] = await db
		.insert(cadastros)
		.values({ nome: createTestName('Clício Fogaça') })
		.returning();
	const [book] = await db
		.insert(livro)
		.values({ titulo: 'Ação e Reação', tombo: sql`nextval(pg_get_serial_sequence('livro', 'idlivro'))::text` })
		.returning();
	const [copy] = await db
		.insert(exemplar)
		.values({ livro: book.idlivro, numero: 1, status: 'Disponível' })
		.returning();
	return { reader, book, copy };
};

type LoanFixture = Awaited<ReturnType<typeof createLoanFixture>>;

export const it = test.extend<{ loan: LoanFixture }>({
	loan: async ({ onTestFinished }, use) => {
		const loan = await createLoanFixture();
		onTestFinished(async () => {
			await db.delete(emprestimo).where(eq(emprestimo.leitor, loan.reader.idleitor));
			await db.delete(exemplar).where(eq(exemplar.livro, loan.book.idlivro));
			await db.delete(livro).where(eq(livro.idlivro, loan.book.idlivro));
			await db.delete(cadastros).where(eq(cadastros.idleitor, loan.reader.idleitor));
		});
		await use(loan);
	},
});

export const createLoanEvent = (values: Record<string, string> = {}, user = bibliotecaUser) => {
	const form = new FormData();
	Object.entries(values).forEach(([key, value]) => form.set(key, value));
	return createRequestEvent({
		locals: { user, session: null },
		request: new Request('http://localhost/biblioteca/emprestimos/novo', { method: 'POST', body: form }),
	});
};

export const loanValues = ({ reader, copy }: LoanFixture) => ({
	leitorid: String(reader.idleitor),
	exemplarid: String(copy.idexemplar),
});

export const readLoans = (loan: LoanFixture) =>
	db.select().from(emprestimo).where(eq(emprestimo.leitor, loan.reader.idleitor));

export const createExistingLoan = (loan: LoanFixture, returned = false) =>
	db.insert(emprestimo).values({
		leitor: loan.reader.idleitor,
		exemplar: loan.copy.idexemplar,
		dataDevolvido: returned ? new Date('2026-08-01T12:00:00Z') : null,
	});

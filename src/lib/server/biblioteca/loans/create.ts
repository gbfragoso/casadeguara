import { db } from '$lib/server/database/connection';
import { cadastros, emprestimo, exemplar, livro } from '$lib/server/database/schema';
import { unaccent } from '$lib/server/database/functions';
import { fail } from '@sveltejs/kit';
import { and, eq, isNull, sql } from 'drizzle-orm';
import dayjs from 'dayjs';

const LOAN_DURATION_DAYS = 14;

export const listReaders = () =>
	db.select({ idleitor: cadastros.idleitor, nome: cadastros.nome }).from(cadastros).orderBy(unaccent(cadastros.nome));

export const listCopies = () =>
	db
		.select({ idexemplar: exemplar.idexemplar, numero: exemplar.numero, titulo: livro.titulo, tombo: livro.tombo })
		.from(exemplar)
		.innerJoin(livro, eq(livro.idlivro, exemplar.livro))
		.where(eq(exemplar.status, 'Disponível'))
		.orderBy(sql<number>`cast(livro.tombo as decimal)`, exemplar.numero);

export const rejectLoan = (field: 'leitor' | 'exemplar', message: string) => fail(400, { status: 400, field, message });

export async function validateReader(readerId: number, isAdmin: boolean) {
	const [reader] = await db
		.select({ ativo: cadastros.status })
		.from(cadastros)
		.where(eq(cadastros.idleitor, readerId));
	if (!reader) return rejectLoan('leitor', 'Leitor não encontrado');
	if (!reader.ativo && !isAdmin) return rejectLoan('leitor', 'Este leitor está inativo');

	const loans = await db
		.select({ id: emprestimo.idemp })
		.from(emprestimo)
		.where(and(eq(emprestimo.leitor, readerId), isNull(emprestimo.dataDevolvido)));
	if (loans.length > 0 && !isAdmin) return rejectLoan('leitor', 'Este leitor já possui um empréstimo ativo');
}

export async function recordLoan(readerId: number, copyId: number, userId: string) {
	const [created] = await db
		.insert(emprestimo)
		.values({
			leitor: readerId,
			exemplar: copyId,
			dataEmprestimo: new Date(),
			dataDevolucao: dayjs().add(LOAN_DURATION_DAYS, 'day').toDate(),
			userEmprestimo: userId,
		})
		.returning({ id: emprestimo.idemp });
	await db.update(exemplar).set({ status: 'Emprestado' }).where(eq(exemplar.idexemplar, copyId));
	return created.id;
}

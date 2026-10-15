import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { cadastros, emprestimo, exemplar, livro, user } from '#lib/server/database/schema.js';
import { requireLibraryAccess } from '#lib/server/authorization/biblioteca.js';
import { error } from '@sveltejs/kit';
import { and, eq, not } from 'drizzle-orm';
import validator from 'validator';

const findLoan = async (id: number) => {
	try {
		const [loan] = await db
			.select({
				leitor: cadastros.nome,
				livro: livro.titulo,
				idexemplar: emprestimo.exemplar,
				idlivro: livro.idlivro,
				numero: exemplar.numero,
				dataEmprestimo: emprestimo.dataEmprestimo,
				dataDevolvido: emprestimo.dataDevolvido,
				usuarioEmprestimo: user.name,
			})
			.from(emprestimo)
			.innerJoin(cadastros, eq(emprestimo.leitor, cadastros.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.innerJoin(user, eq(user.id, emprestimo.userEmprestimo))
			.where(eq(emprestimo.idemp, id));
		return loan;
	} catch (err) {
		console.error(err);
		error(500, 'Falha ao baixar os dados do empréstimo');
	}
};

const listSwappableCopies = async (idlivro: number, idexemplar: number) =>
	db
		.select({
			idexemplar: exemplar.idexemplar,
			livro: livro.titulo,
			numero: exemplar.numero,
		})
		.from(exemplar)
		.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
		.where(
			and(
				eq(exemplar.livro, idlivro),
				eq(exemplar.status, 'Disponível'),
				not(eq(exemplar.idexemplar, idexemplar)),
			),
		)
		.orderBy(exemplar.numero);

const load = async ({ locals, params }: RequestEvent) => {
	requireLibraryAccess(locals.user);

	const loan = await findLoan(Number(params.id));
	if (!loan) error(404, 'Empréstimo não encontrado');

	return { emprestimo: loan, exemplares: listSwappableCopies(loan.idlivro, loan.idexemplar) };
};

const actions: Actions = {
	default: async ({ request, params, locals }) => {
		requireLibraryAccess(locals.user);

		const form = await request.formData();
		const idexemplar = form.get('idexemplar') as string;
		const novoexemplar = form.get('novoexemplar') as string;

		if (validator.isEmpty(novoexemplar, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Selecione um exemplar para trocar',
			};
		}

		try {
			await db
				.update(emprestimo)
				.set({ exemplar: Number(novoexemplar) })
				.where(eq(emprestimo.idemp, Number(params.id)));
			await db
				.update(exemplar)
				.set({ status: 'Disponível' })
				.where(eq(exemplar.idexemplar, Number(idexemplar)));
			await db
				.update(exemplar)
				.set({ status: 'Emprestado' })
				.where(eq(exemplar.idexemplar, Number(novoexemplar)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao atualizar os dados do empréstimo');
		}
	},
};

export const createBibliotecaEmprestimosIdIntegerHandlers = () => ({
	load,
	actions,
});

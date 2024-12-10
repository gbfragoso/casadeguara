import { db } from '$lib/database/connection';
import { emprestimo, exemplar, leitor, livro, user } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, not } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const resultado = await db
			.select({
				leitor: leitor.nome,
				livro: livro.titulo,
				idexemplar: emprestimo.exemplar,
				idlivro: livro.idlivro,
				numero: exemplar.numero,
				dataEmprestimo: emprestimo.dataEmprestimo,
				dataDevolvido: emprestimo.dataDevolvido,
				usuarioEmprestimo: user.name,
			})
			.from(emprestimo)
			.innerJoin(leitor, eq(emprestimo.leitor, leitor.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.innerJoin(user, eq(user.id, emprestimo.userEmprestimo))
			.where(eq(emprestimo.idemp, Number(params.id)));

		if (!resultado) {
			throw fail(404, { message: 'Empréstimo não encontrado' });
		}

		const idlivro = resultado[0].idlivro;
		const idexemplar = resultado[0].idexemplar;

		const exemplares = async () => {
			return db
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
		};

		return { emprestimo: resultado[0], exemplares: exemplares() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao baixar os dados do empréstimo',
		});
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
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
			return error(500, {
				message: 'Falha ao atualizar os dados do empréstimo',
			});
		}
	},
};

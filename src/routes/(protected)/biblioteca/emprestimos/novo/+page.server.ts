import { db } from '$lib/database/connection';
import { emprestimo, exemplar, leitor, livro } from '$lib/database/schema';
import { unaccent } from '$lib/database/functions';
import { error, redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import { and, eq, isNull, sql } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const leitores = async () => {
			return db
				.select({ idleitor: leitor.idleitor, nome: leitor.nome })
				.from(leitor)
				.orderBy(unaccent(leitor.nome));
		};

		const exemplares = async () => {
			return db
				.select({
					idexemplar: exemplar.idexemplar,
					numero: exemplar.numero,
					titulo: livro.titulo,
					tombo: livro.tombo,
				})
				.from(exemplar)
				.innerJoin(livro, eq(livro.idlivro, exemplar.livro))
				.where(eq(exemplar.status, 'Disponível'))
				.orderBy(sql<number>`cast(livro.tombo as decimal)`, exemplar.numero);
		};

		return { leitores: leitores(), exemplares: exemplares() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar os dados para empréstimo',
		});
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const idleitor = Number(form.get('leitor'));
		const idexemplar = Number(form.get('exemplar'));

		const leitores = await db.select({ ativo: leitor.status }).from(leitor).where(eq(leitor.idleitor, idleitor));
		if (!leitores[0].ativo) {
			return {
				status: 400,
				field: 'leitor',
				message: 'Este leitor está inativo',
			};
		}

		const emprestimos = await db
			.select()
			.from(emprestimo)
			.where(and(eq(emprestimo.leitor, idleitor), isNull(emprestimo.dataDevolvido)));
		if (emprestimos.length > 0) {
			return {
				status: 400,
				field: 'leitor',
				message: 'Este leitor já possui um empréstimo ativo',
			};
		}

		await db.insert(emprestimo).values({
			leitor: idleitor,
			exemplar: idexemplar,
			dataEmprestimo: new Date(),
			dataDevolucao: dayjs().add(14, 'day').toDate(),
		});
		return redirect(302, '/biblioteca/emprestimos/' + idleitor + '/recibo');
	},
} satisfies Actions;

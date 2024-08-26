import { db } from '$lib/database/connection';
import { emprestimo, exemplar, leitor, livro } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	const id = Number(params.leitor);

	try {
		const emprestimos = await db
			.select({
				idemp: emprestimo.idemp,
				idleitor: leitor.idleitor,
				leitor: leitor.nome,
				tombo: livro.tombo,
				titulo: livro.titulo,
				numero: exemplar.numero,
				renovacoes: emprestimo.renovacoes,
				data_devolucao: emprestimo.data_devolucao,
				data_emprestimo: emprestimo.data_emprestimo,
				data_devolvido: emprestimo.data_devolvido,
			})
			.from(emprestimo)
			.innerJoin(leitor, eq(emprestimo.leitor, leitor.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.where(eq(leitor.idleitor, id))
			.orderBy(desc(emprestimo.data_emprestimo));

		return { emprestimos };
	} catch (err) {
		return error(500, {
			message: 'Falha ao carregar a lista de empréstimos',
		});
	}
};

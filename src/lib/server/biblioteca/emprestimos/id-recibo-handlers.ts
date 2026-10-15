import type { RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { cadastros, emprestimo, exemplar, livro } from '#lib/server/database/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

const load = async ({ locals, params }: RequestEvent) => {
	if (!locals.user) redirect(302, '/');

	const id = Number(params.id);

	try {
		const emprestimos = await db
			.select({
				idemp: emprestimo.idemp,
				idleitor: cadastros.idleitor,
				leitor: cadastros.nome,
				tombo: livro.tombo,
				titulo: livro.titulo,
				numero: exemplar.numero,
				renovacoes: emprestimo.renovacoes,
				data_devolucao: emprestimo.dataDevolucao,
				data_emprestimo: emprestimo.dataEmprestimo,
				data_devolvido: emprestimo.dataDevolvido,
			})
			.from(emprestimo)
			.innerJoin(cadastros, eq(emprestimo.leitor, cadastros.idleitor))
			.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
			.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
			.where(eq(emprestimo.idemp, id))
			.orderBy(desc(emprestimo.dataEmprestimo));

		return { emprestimos };
	} catch (err) {
		console.error(err);
		return error(500, 'Falha ao carregar os dados do empréstimo');
	}
};

export const createBibliotecaEmprestimosIdIntegerReciboHandlers = () => ({
	load,
});

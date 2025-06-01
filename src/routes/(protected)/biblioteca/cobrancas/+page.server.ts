import { db } from '$lib/database/connection';
import { emprestimo, exemplar, leitor, livro } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
	if (!locals.user.roles.includes('biblioteca:admin')) redirect(302, '/biblioteca');

	try {
		const emprestimos = async () => {
			return db
				.select({
					idemp: emprestimo.idemp,
					idleitor: leitor.idleitor,
					leitor: leitor.nome,
					celular: leitor.celular,
					telefone: leitor.telefone,
					email: leitor.email,
					cobranca: emprestimo.cobranca,
					titulo: livro.titulo,
					numero: exemplar.numero,
					renovacoes: emprestimo.renovacoes,
					data_devolucao: emprestimo.dataDevolucao,
					data_emprestimo: emprestimo.dataEmprestimo,
					data_devolvido: emprestimo.dataDevolvido,
				})
				.from(emprestimo)
				.innerJoin(leitor, eq(emprestimo.leitor, leitor.idleitor))
				.innerJoin(exemplar, eq(emprestimo.exemplar, exemplar.idexemplar))
				.innerJoin(livro, eq(exemplar.livro, livro.idlivro))
				.where(and(lt(emprestimo.dataDevolucao, new Date()), isNull(emprestimo.dataDevolvido)))
				.orderBy(desc(emprestimo.dataEmprestimo));
		};

		return { emprestimos: emprestimos() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de empréstimos',
		});
	}
};

export const actions: Actions = {
	whatsapp: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const titulo = form.get('titulo') as string;
		const leitor = form.get('leitor') as string;
		const prazo = form.get('prazo') as string;
		const telefone = form.get('telefone') as string;
		const body =
			'Estimado(a) ' +
			leitor +
			', o prazo para devolução do livro ' +
			titulo +
			' expirou em ' +
			prazo +
			', se possível dirigir-se à biblioteca para regularização. Atenciosamente, Clébio Fragoso';

		await db
			.update(emprestimo)
			.set({ cobranca: new Date() })
			.where(eq(emprestimo.idemp, Number(id)));

		redirect(302, 'https://wa.me/' + telefone + '?text=' + encodeURIComponent(body));
	},
	email: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id') as string;
		const titulo = form.get('titulo') as string;
		const leitor = form.get('leitor') as string;
		const prazo = form.get('prazo') as string;
		const email = form.get('email') as string;
		const body =
			'Estimado(a) ' +
			leitor +
			',%0D%0A%0D%0AO prazo para devolução do livro ' +
			titulo +
			' expirou em ' +
			prazo +
			', se possível dirigir-se à biblioteca para regularização.%0D%0A%0D%0AAtenciosamente, Clébio Fragoso';

		await db
			.update(emprestimo)
			.set({ cobranca: new Date() })
			.where(eq(emprestimo.idemp, Number(id)));

		redirect(302, 'mailto:' + email + '?subject=Prazo para devolução expirado&body=' + body);
	},
} satisfies Actions;

import { db } from '$lib/database/connection';
import { emprestimo, exemplar } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) redirect(302, '/');
	const idemprestimo = url.searchParams.get('id');

	try {
		const emp = await db
			.select({ idexemplar: emprestimo.exemplar })
			.from(emprestimo)
			.where(eq(emprestimo.idemp, Number(idemprestimo)));
		await db
			.update(emprestimo)
			.set({ dataDevolvido: new Date(), userDevolucao: locals.user.id })
			.where(eq(emprestimo.idemp, Number(idemprestimo)));
		await db
			.update(exemplar)
			.set({ status: 'Disponível' })
			.where(eq(exemplar.idexemplar, Number(emp[0].idexemplar)));
		return new Response('Empréstimo devolvido com sucesso');
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao devolver o empréstimo',
		});
	}
};

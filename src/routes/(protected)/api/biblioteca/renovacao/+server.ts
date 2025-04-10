import { db } from '$lib/database/connection';
import { emprestimo } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) redirect(302, '/');

	const id = url.searchParams.get('id');

	try {
		const resultado = await db
			.update(emprestimo)
			.set({
				dataDevolucao: sql`${emprestimo.dataEmprestimo} + (14 + (renovacoes + 1) * 14)::int`,
				renovacoes: sql<number>`renovacoes + 1`,
			})
			.where(eq(emprestimo.idemp, Number(id)))
			.returning({
				dataDevolucao: emprestimo.dataDevolucao,
			});

		return new Response(resultado[0].dataDevolucao?.toISOString());
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao renovar o empréstimo',
		});
	}
};

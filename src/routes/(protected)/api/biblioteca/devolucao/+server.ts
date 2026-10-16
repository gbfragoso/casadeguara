import { db } from '#lib/server/database/connection.js';
import { emprestimo, exemplar } from '#lib/server/database/schema.js';
import { requireLibraryAccess } from '#lib/server/authorization/biblioteca.js';
import { readBahiaCivilDate } from '#lib/utils/date.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url, locals }) => {
	const user = requireLibraryAccess(locals.user);
	const idemprestimo = url.searchParams.get('id');

	try {
		const emp = await db
			.select({ idexemplar: emprestimo.exemplar })
			.from(emprestimo)
			.where(eq(emprestimo.idemp, Number(idemprestimo)));
		await db
			.update(emprestimo)
			.set({ dataDevolvido: readBahiaCivilDate(new Date()), userDevolucao: user.id })
			.where(eq(emprestimo.idemp, Number(idemprestimo)));
		await db
			.update(exemplar)
			.set({ status: 'Disponível' })
			.where(eq(exemplar.idexemplar, Number(emp[0].idexemplar)));
		return new Response('Empréstimo devolvido com sucesso');
	} catch (err) {
		console.error(err);
		return error(500, 'Falha ao devolver o empréstimo');
	}
};

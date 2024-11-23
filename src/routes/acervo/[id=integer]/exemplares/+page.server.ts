import { db } from '$lib/database/connection';
import { exemplar } from '$lib/database/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const exemplares = async () => {
			return db
				.select()
				.from(exemplar)
				.where(eq(exemplar.livro, Number(params.id)))
				.orderBy(exemplar.numero);
		};
		return { exemplares: exemplares() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de autores',
		});
	}
};

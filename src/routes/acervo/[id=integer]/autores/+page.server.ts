import { db } from '$lib/database/connection';
import { autor, autorHasLivro } from '$lib/database/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const autoresLivro = async () => {
			return db
				.select({ idautor: autor.idautor, nome: autor.nome })
				.from(autorHasLivro)
				.innerJoin(autor, eq(autorHasLivro.autor, autor.idautor))
				.where(eq(autorHasLivro.livro, Number(params.id)))
				.orderBy(autor.nome);
		};

		return { autoresLivro: autoresLivro() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de autores',
		});
	}
};

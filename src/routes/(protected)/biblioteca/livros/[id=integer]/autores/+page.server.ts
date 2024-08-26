import { db } from '$lib/database/connection';
import { autor, autor_has_livro } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const autores = await db.select().from(autor).orderBy(autor.nome);
		const autoresLivro = await db
			.select({ idautor: autor.idautor, nome: autor.nome })
			.from(autor_has_livro)
			.innerJoin(autor, eq(autor_has_livro.autor, autor.idautor))
			.where(eq(autor_has_livro.livro, Number(params.id)))
			.orderBy(autor.nome);

		return { autores, autoresLivro, role: locals.user.roles };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de autores' });
	}
};

export const actions: Actions = {
	adicionar: async ({ request, params }) => {
		const form = await request.formData();
		const livro = Number(params.id);
		const autor = Number(form.get('autor'));

		try {
			await db.insert(autor_has_livro).values({ autor, livro });
			return { status: 201 };
		} catch (err) {
			return error(500, { message: 'Falha ao criar um novo autor' });
		}
	},
	excluir: async ({ url, params }) => {
		const livro = Number(params.id);
		const autor = url.searchParams.get('autor');
		if (!autor) {
			return fail(400, {
				message: 'Nenhum autor foi selecionada para exclusão',
			});
		}

		try {
			await db
				.delete(autor_has_livro)
				.where(and(eq(autor_has_livro.livro, livro), eq(autor_has_livro.autor, Number(autor))));
			return { status: 200 };
		} catch (err) {
			console.log(err);
			return error(500, { message: 'Falha ao excluir o autor' });
		}
	},
};

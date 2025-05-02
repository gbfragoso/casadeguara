import { db } from '$lib/database/connection';
import { autor, autorHasLivro, livro } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const livros = async () => {
			return db
				.select()
				.from(livro)
				.where(eq(livro.idlivro, Number(params.id)));
		};
		const autores = async () => {
			return db.select().from(autor).orderBy(autor.nome);
		};
		const autoresLivro = async () => {
			return db
				.select({ idautor: autor.idautor, nome: autor.nome })
				.from(autorHasLivro)
				.innerJoin(autor, eq(autorHasLivro.autor, autor.idautor))
				.where(eq(autorHasLivro.livro, Number(params.id)))
				.orderBy(autor.nome);
		};

		return { autores: autores(), autoresLivro: autoresLivro(), livros: livros(), role: locals.user.roles };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de autores',
		});
	}
};

export const actions: Actions = {
	adicionar: async ({ request, params }) => {
		const form = await request.formData();
		const livro = Number(params.id);
		const autor = Number(form.get('autor'));

		try {
			await db.insert(autorHasLivro).values({ autor, livro });
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao criar um novo autor',
			});
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
				.delete(autorHasLivro)
				.where(and(eq(autorHasLivro.livro, livro), eq(autorHasLivro.autor, Number(autor))));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao excluir o autor',
			});
		}
	},
};

import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { autor, autorHasLivro, livro } from '#lib/server/database/schema.js';
import {
	hasLibraryAdminAccess,
	requireLibraryAccess,
	requireLibraryAdminAccess,
} from '#lib/server/authorization/biblioteca.js';
import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

const load = async ({ locals, params }: RequestEvent) => {
	const isAdmin = hasLibraryAdminAccess(requireLibraryAccess(locals.user));

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

		return { autores: autores(), autoresLivro: autoresLivro(), livros: livros(), isAdmin };
	} catch (err) {
		console.error(err);
		return error(500, 'Falha ao carregar a lista de autores');
	}
};

const actions: Actions = {
	adicionar: async ({ request, params, locals }) => {
		requireLibraryAccess(locals.user);

		const form = await request.formData();
		const livro = Number(params.id);
		const autor = Number(form.get('autor'));

		try {
			await db.insert(autorHasLivro).values({ autor, livro });
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao criar um novo autor');
		}
	},
	excluir: async ({ url, params, locals }) => {
		requireLibraryAdminAccess(locals.user);

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
			return error(500, 'Falha ao excluir o autor');
		}
	},
};

export const createBibliotecaLivrosIdIntegerAutoresHandlers = () => ({
	load,
	actions,
});

import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { keyword, livroHasKeyword, livro } from '#lib/server/database/schema.js';
import {
	hasLibraryAdminAccess,
	requireLibraryAccess,
	requireLibraryAdminAccess,
} from '#lib/server/authorization/biblioteca.js';
import { keywordReferenceSchema } from '#lib/validation/keyword.js';
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

		const keywords = async () => {
			return db.select().from(keyword).orderBy(keyword.chave);
		};

		const keywordsLivro = async () => {
			return db
				.select({ idkeyword: keyword.idkeyword, chave: keyword.chave, referencia: livroHasKeyword.referencia })
				.from(livroHasKeyword)
				.innerJoin(keyword, eq(livroHasKeyword.keyword, keyword.idkeyword))
				.where(eq(livroHasKeyword.livro, Number(params.id)))
				.orderBy(keyword.chave);
		};

		return { keywords: keywords(), keywordsLivro: keywordsLivro(), livros: livros(), isAdmin };
	} catch (err) {
		console.error(err);
		return error(500, 'Falha ao carregar a lista de keywords');
	}
};

const actions: Actions = {
	adicionar: async ({ request, params, locals }) => {
		requireLibraryAccess(locals.user);

		const form = await request.formData();
		const livro = Number(params.id);
		const keyword = Number(form.get('keyword'));
		const reference = keywordReferenceSchema.safeParse(form.get('referencia') ?? '');
		if (!reference.success) return fail(400, { errors: { referencia: [reference.error.issues[0].message] } });

		try {
			await db.insert(livroHasKeyword).values({ keyword, livro, referencia: reference.data });
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao criar uma nova palavra-chave');
		}
	},
	excluir: async ({ url, params, locals }) => {
		requireLibraryAdminAccess(locals.user);

		const livro = Number(params.id);
		const keyword = url.searchParams.get('keyword');
		if (!keyword) {
			return fail(400, {
				message: 'Nenhuma palavra-chave foi selecionada para exclusão',
			});
		}

		try {
			await db
				.delete(livroHasKeyword)
				.where(and(eq(livroHasKeyword.livro, livro), eq(livroHasKeyword.keyword, Number(keyword))));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, 'Falha ao excluir a palavra-chave');
		}
	},
};

export const createBibliotecaLivrosIdIntegerKeywordsHandlers = () => ({
	load,
	actions,
});

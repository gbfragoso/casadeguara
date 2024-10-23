import { db } from '$lib/database/connection';
import { keyword, livroHasKeyword } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, '/');

	try {
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

		return { keywords: keywords(), keywordsLivro: keywordsLivro(), role: locals.user.roles };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de keywords',
		});
	}
};

export const actions: Actions = {
	adicionar: async ({ request, params }) => {
		const form = await request.formData();
		const livro = Number(params.id);
		const keyword = Number(form.get('keyword'));

		try {
			await db.insert(livroHasKeyword).values({ keyword, livro });
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao criar uma nova palavra-chave',
			});
		}
	},
	excluir: async ({ url, params }) => {
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
			console.log(err);
			return error(500, {
				message: 'Falha ao excluir a palavra-chave',
			});
		}
	},
};

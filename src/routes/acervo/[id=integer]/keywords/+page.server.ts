import { db } from '$lib/database/connection';
import { keyword, livroHasKeyword } from '$lib/database/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const keywordsLivro = async () => {
			return db
				.select({ idkeyword: keyword.idkeyword, chave: keyword.chave, referencia: livroHasKeyword.referencia })
				.from(livroHasKeyword)
				.innerJoin(keyword, eq(livroHasKeyword.keyword, keyword.idkeyword))
				.where(eq(livroHasKeyword.livro, Number(params.id)))
				.orderBy(keyword.chave);
		};

		return { keywordsLivro: keywordsLivro() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de keywords',
		});
	}
};

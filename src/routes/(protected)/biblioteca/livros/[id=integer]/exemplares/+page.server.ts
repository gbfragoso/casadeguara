import { db } from '$lib/database/connection';
import { exemplar, livro } from '$lib/database/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

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
		const exemplares = async () => {
			return db
				.select()
				.from(exemplar)
				.where(eq(exemplar.livro, Number(params.id)))
				.orderBy(exemplar.numero);
		};
		return { exemplares: exemplares(), livros: livros(), role: locals.user.roles };
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
		const id = Number(params.id);
		const numero = Number(form.get('numero'));

		if (!id) {
			return fail(400, {
				message: 'Nenhum livro foi selecionada para exclusão',
			});
		}

		try {
			await db.insert(exemplar).values({
				livro: id,
				numero,
				status: 'Disponível',
				dataCadastro: new Date(),
			});
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao criar um novo autor',
			});
		}
	},
	disponivel: async ({ url }) => {
		const id = url.searchParams.get('exemplar');
		if (!id) {
			return fail(400, {
				message: 'Nenhum exemplar foi selecionada para disponibilizar',
			});
		}

		try {
			await db
				.update(exemplar)
				.set({ status: 'Disponível' })
				.where(eq(exemplar.idexemplar, Number(id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao disponibilizar o exemplar',
			});
		}
	},
	arquivar: async ({ url }) => {
		const id = url.searchParams.get('exemplar');
		if (!id) {
			return fail(400, {
				message: 'Nenhum exemplar foi selecionada para arquivar',
			});
		}

		try {
			await db
				.update(exemplar)
				.set({ status: 'Arquivado' })
				.where(eq(exemplar.idexemplar, Number(id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao arquivar o exemplar',
			});
		}
	},
	excluir: async ({ url }) => {
		const id = url.searchParams.get('exemplar');
		if (!id) {
			return fail(400, {
				message: 'Nenhum exemplar foi selecionada para exclusão',
			});
		}

		try {
			await db.delete(exemplar).where(eq(exemplar.idexemplar, Number(id)));
			return { status: 200 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao excluir o exemplar',
			});
		}
	},
};

import type { Actions, RequestEvent } from '@sveltejs/kit';

import { db } from '#lib/server/database/connection.js';
import { exemplar, livro } from '#lib/server/database/schema.js';
import { requireLibraryAccess, requireLibraryAdminAccess } from '#lib/server/authorization/biblioteca.js';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

const load = async ({ locals, params }: RequestEvent) => {
	const user = requireLibraryAccess(locals.user);

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
		return { exemplares: exemplares(), livros: livros(), role: user.roles };
	} catch (err) {
		console.error(err);
		return error(500, 'Falha ao carregar a lista de autores');
	}
};

const actions: Actions = {
	adicionar: async ({ request, params, locals }) => {
		requireLibraryAccess(locals.user);

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
			return error(500, 'Falha ao criar um novo autor');
		}
	},
	disponivel: async ({ url, locals }) => {
		requireLibraryAdminAccess(locals.user);

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
			return error(500, 'Falha ao disponibilizar o exemplar');
		}
	},
	arquivar: async ({ url, locals }) => {
		requireLibraryAdminAccess(locals.user);

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
			return error(500, 'Falha ao arquivar o exemplar');
		}
	},
	excluir: async ({ url, locals }) => {
		requireLibraryAdminAccess(locals.user);

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
			return error(500, 'Falha ao excluir o exemplar');
		}
	},
};

export const createBibliotecaLivrosIdIntegerExemplaresHandlers = () => ({
	load,
	actions,
});

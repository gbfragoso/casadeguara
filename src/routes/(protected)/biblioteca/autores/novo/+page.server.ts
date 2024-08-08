import { autor } from "$lib/database/schema";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({locals}) => {
	if (!locals.user) redirect(302, "/");
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;

		if (!nome || nome.length === 0 || /^\s*$/.test(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do autor é obrigatório'
			}
		}

		if (/^\d+$/.test(nome)) {
			return {
				status: 400,
				field: 'descricao',
				message: 'Nome do autor não pode ser somente números'
			}
		}

		try {
			await db.insert(autor).values( { nome: nome.toUpperCase() });
		} catch (err) {
			return error(500, { message: 'Falha ao criar um novo autor' });
		}

		return {
			status: 201
		};
	}
} satisfies Actions;

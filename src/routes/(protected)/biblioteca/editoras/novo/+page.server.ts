import { editora } from "$lib/database/schema";
import { db } from '$lib/database/connection';
import { error } from '@sveltejs/kit';
import validator from "validator";

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const nome = form.get('nome') as string;

		if (validator.isEmpty(nome, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome da editora é obrigatório'
			}
		}

		if (validator.isNumeric(nome)) {
			return {
				status: 400,
				field: 'nome',
				message: 'Nome do editora não pode ser somente números'
			}
		}

		try {
			await db.insert(editora).values({ nome: nome.toUpperCase() });
			return { status: 201 };
		} catch (err) {
			return error(500, { message: 'Falha ao criar uma nova editora' });
		}	
	}
} satisfies Actions;

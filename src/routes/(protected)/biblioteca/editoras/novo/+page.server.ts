import { editora } from "$lib/database/schema";
import { db } from '$lib/database/connection';
import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await db.insert(editora).values({ nome: nome.toUpperCase() });
			return { status: 201 };
		} catch (err) {
			return error(500, { message: 'Falha ao criar uma nova editora' });
		}	
	}
} satisfies Actions;

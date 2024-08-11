import { leitor } from "$lib/database/schema";
import { eq } from "drizzle-orm";
import { db } from '$lib/database/connection';
import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const { nome } = Object.fromEntries(await request.formData()) as {
			nome: string;
		};

		try {
			await db.insert(leitor).values({
				nome: nome.toUpperCase()
			}
			);
			return { status: 201 };
		} catch (err) {
			return error(500, { message: 'Falha ao criar um novo leitor' });
		}
	}
} satisfies Actions;

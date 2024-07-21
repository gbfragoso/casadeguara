import { keyword } from "$lib/database/schema";
import { db } from '$lib/database/connection';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, "/login");
};

export const actions: Actions = {
	default: async ({ request }) => {
		const { chave } = Object.fromEntries(await request.formData()) as {
			chave: string;
		};

		try {
			await db.insert(keyword).values({ chave: chave.toUpperCase() });
			return { status: 201 }
		} catch (err) {
			return error(500, { message: 'Falha ao criar um nova palavra-chave' });
		}
	}
} satisfies Actions;

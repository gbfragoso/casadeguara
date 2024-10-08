import { db } from '$lib/database/connection';
import { aviso } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import validator from 'validator';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const avisos = async () => {
			return db.select().from(aviso).orderBy(desc(aviso.dataCadastro)).limit(5);
		};
		return { avisos: avisos() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de avisos',
		});
	}
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const form = await request.formData();
		const texto = form.get('texto') as string;

		if (validator.isEmpty(texto, { ignore_whitespace: true })) {
			return {
				status: 400,
				field: 'texto',
				message: 'Texto do aviso é obrigatório',
			};
		}

		try {
			await db.insert(aviso).values({ texto, username: locals.user?.name });
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao criar um novo autor',
			});
		}
	},
} satisfies Actions;

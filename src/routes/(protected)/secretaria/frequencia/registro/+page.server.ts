import { db } from '$lib/database/connection';
import { unaccent } from '$lib/database/functions';
import { leitor, frequencia } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const leitores = async () => {
			return db
				.select({ idleitor: leitor.idleitor, nome: leitor.nome })
				.from(leitor)
				.where(eq(leitor.trab, true))
				.orderBy(unaccent(leitor.nome));
		};

		return { leitores: leitores() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar os leitores',
		});
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const leitores = form.getAll('leitor');
		const data = form.get('data') as string;
		let array: { trabalhador: number; dataPresenca: Date }[] = [];

		leitores.forEach((e) => {
			const item = {
				trabalhador: Number(e),
				dataPresenca: new Date(data),
			};
			array.push(item);
		});
		try {
			await db.insert(frequencia).values(array);
			return { status: 201 };
		} catch (err) {
			console.error(err);
			return error(500, {
				message: 'Falha ao criar um novo autor',
			});
		}
	},
} satisfies Actions;

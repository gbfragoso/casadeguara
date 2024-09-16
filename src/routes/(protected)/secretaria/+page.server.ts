import { db } from '$lib/database/connection';
import { frequencia, leitor } from '$lib/database/schema';
import { error, redirect } from '@sveltejs/kit';
import { and, count, eq, gte, isNotNull, lte, sum } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	try {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const dateFilter = and(gte(frequencia.dataPresenca, firstDay), lte(frequencia.dataPresenca, lastDay));

		const leitores = async () => {
			return db.select({ counter: count() }).from(leitor).where(eq(leitor.trab, true));
		};

		const engajamento = async () => {
			return db.select({ counter: count() }).from(frequencia).where(dateFilter);
		};

		return {
			leitores: leitores(),
			engajamento: engajamento(),
		};
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar as informações da secretaria',
		});
	}
};

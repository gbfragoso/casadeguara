import { db } from '$lib/database/connection';
import { entradas, leitor } from '$lib/database/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const entrada = async () => {
			return db
				.select({
					id: entradas.identrada,
					valor: entradas.valor,
					descricao: entradas.descricao,
					contribuinte: leitor.nome,
					dataEntrada: entradas.dataEntrada,
					dataRegistro: entradas.dataRegistro,
				})
				.from(entradas)
				.innerJoin(leitor, eq(leitor.idleitor, entradas.idcontribuinte))
				.where(eq(entradas.uuid, params.uuid));
		};

		return { entrada: entrada() };
	} catch (err) {
		console.error(err);
		return error(500, {
			message: 'Falha ao carregar a lista de entrada',
		});
	}
};

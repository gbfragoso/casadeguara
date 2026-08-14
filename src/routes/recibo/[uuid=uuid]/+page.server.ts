import { db } from '$lib/database/connection';
import { cadastros, entradas } from '$lib/database/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const entrada = await db
		.select({
			id: entradas.identrada,
			valor: entradas.valor,
			descricao: entradas.descricao,
			contribuinte: cadastros.nome,
			dataEntrada: entradas.dataEntrada,
			dataRegistro: entradas.dataRegistro,
		})
		.from(entradas)
		.innerJoin(cadastros, eq(cadastros.idleitor, entradas.idcontribuinte))
		.where(eq(entradas.uuid, params.uuid));

	if (entrada.length == 0) {
		return error(404, {
			message: 'Recibo inexistente',
		});
	}

	return { entrada: entrada[0] };
};

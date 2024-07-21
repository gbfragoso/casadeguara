import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const { descricao, valor, data_saida } = Object.fromEntries(await request.formData()) as {
			descricao: string;
			valor: string;
			data_saida: string;
		};

		try {
			// await prisma.saidas.create({
			// 	data: {
			// 		valor: valor,
			// 		descricao: descricao,
			// 		data_saida: new Date(data_saida)
			// 	}
			// });
		} catch (err) {
			console.error(err);
			return error(500, { message: 'Falha ao cadastrar um novo pagamento' });
		}

		return {
			status: 201
		};
	}
} satisfies Actions;

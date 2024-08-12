import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) redirect(302, "/");
	// const exemplar = await prisma.exemplar.findUnique({
	// 	where: {
	// 		idexemplar: Number(params.id)
	// 	}
	// });

	// if (!exemplar) {
	// 	throw error(404, 'Exemplar não encontrado');
	// }
	return {  };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const { status } = Object.fromEntries(await request.formData()) as {
			status: string;
		};

		// try {
		// 	await prisma.exemplar.update({
		// 		data: {
		// 			status: status
		// 		},
		// 		where: {
		// 			idexemplar: Number(params.id)
		// 		}
		// 	});
		// } catch (err) {
		// 	return error(500, { message: 'Falha ao atualizar os dados do exemplar' });
		// }

		return {
			status: 200
		};
	}
};

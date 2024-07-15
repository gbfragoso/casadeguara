import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const nome = url.searchParams.get('nome')?.toUpperCase() || undefined;
	const leitores = await prisma.leitor.findMany({
		take: 10,
		where: {
			nome: {
				contains: nome
			}
		}
	});
	const total = await prisma.leitor.count();
	return { leitores, total };
};

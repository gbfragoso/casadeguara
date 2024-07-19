import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome')?.toUpperCase() || undefined;

	const where = {
		nome: {
			startsWith: nome
		}
	};

	const contribuintes = await prisma.leitor.findMany({
		skip: (page - 1) * 10,
		take: 10,
		where: where,
		orderBy: {
			nome: 'asc',
		}
	});

	const total = await prisma.leitor.count({ where });
	return { contribuintes, total };
};

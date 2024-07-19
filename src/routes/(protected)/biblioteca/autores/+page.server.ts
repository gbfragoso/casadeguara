import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, "/login");

	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('nome')?.toUpperCase() || undefined;
	const where = {
		nome: {
			startsWith: nome
		}
	};
	
	try {
		const autores = await prisma.autor.findMany({
			skip: (page - 1) * 10,
			take: 10,
			where
		});
	
		const total = await prisma.autor.count({
			where
		});
		return { autores, total };
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a lista de autores' });
	}
};

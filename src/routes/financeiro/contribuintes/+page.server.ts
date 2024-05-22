import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const contribuintes = await prisma.contribuinte.findMany({
		skip: 0,
		take: 50
	});

	return { contribuintes };
};

import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const saidas = await prisma.saidas.findMany({
        skip: 0,
        take: 50
    });

    return {
        saidas: JSON.parse(JSON.stringify(saidas))
    }
};
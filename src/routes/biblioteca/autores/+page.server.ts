import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const nome = url.searchParams.get('nome')?.toUpperCase() || undefined;
    const autores = await prisma.autor.findMany({
        take: 10,
        where: {
            nome: {
                startsWith: nome
            }
        }
    });
    return { autores };
}
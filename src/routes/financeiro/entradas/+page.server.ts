import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const entradas = await prisma.entradas.findMany({
        skip: 0,
        take: 50,
        include: {
            contribuinte_entradas_contribuinteTocontribuinte: {
                select: {
                    nome: true
                }
            }
        }
    });

    return {
        entradas: JSON.parse(JSON.stringify(entradas))
    }
};
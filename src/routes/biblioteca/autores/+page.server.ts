import { prisma } from '$lib/server/prisma';
import { fail, error } from '@sveltejs/kit';


import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

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

export const actions: Actions = {
    excluir: async ({ url }) => {
        const id = url.searchParams.get("id");
        if (!id) {
            return fail(400, { message: 'Nenhum autor selecionado para exclusão' });
        }

        try {
            await prisma.autor.delete({
                where: {
                    idautor: Number(id)
                }
            });
        } catch (err) {
            return error(500, {message: 'Falha ao excluir o autor'});
        }

        return {
            status: 200
        }
    }
};
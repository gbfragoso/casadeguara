import { prisma } from '$lib/server/prisma';
import { fail, error, redirect } from '@sveltejs/kit';


import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

const removeAccents = function (string: String) {
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const load: PageServerLoad = async ({ url, params }) => {
    const nome = removeAccents(url.searchParams.get('nome') || '');
    const autores = await prisma.autor.findMany({
        take: 10,
        where: {
            nome: {
                startsWith: nome.toUpperCase()
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
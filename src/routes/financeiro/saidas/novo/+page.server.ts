import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {
        const { nome, valor, data_saida } = Object.fromEntries(await request.formData()) as {
            nome: string,
            valor: string,
            data_saida: string;
        }

        try {
            const contribuinte = await prisma.contribuinte.findFirst({
                where: {
                    nome: {
                        startsWith: nome.toUpperCase()
                    }
                }
            })

            await prisma.saidas.create({
                data: {
                    valor: valor,
                    data_saida: new Date(data_saida)
                }
            })
        } catch (err) {
            console.error(err);
            return error(500, { message: 'Falha ao cadastrar uma nova doação' });
        }

        return {
            status: 201
        }
    }
} satisfies Actions;
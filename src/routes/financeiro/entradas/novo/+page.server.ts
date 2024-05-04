import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {
        const { nome, valor, data_entrada } = Object.fromEntries(await request.formData()) as {
            nome: string,
            valor: string,
            data_entrada: string;
        }

        try {
            const contribuinte = await prisma.contribuinte.findFirst({
                where: {
                    nome: {
                        startsWith: nome.toUpperCase()
                    }
                }
            })

            await prisma.entradas.create({
                data: {
                    contribuinte: contribuinte?.idcontribuinte,
                    valor: valor,
                    data_entrada: new Date(data_entrada)
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
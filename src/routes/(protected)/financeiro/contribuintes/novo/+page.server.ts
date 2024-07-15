import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const contribuintes = await prisma.leitor.findMany();
	return { contribuintes };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const { nome, descricao, valor, data_entrada } = Object.fromEntries(
			await request.formData()
		) as {
			nome: string;
			descricao: string;
			valor: string;
			data_entrada: string;
		};

		try {
			const contribuinte = await prisma.leitor.findFirst({
				select: {
					idleitor: true
				},
				where: {
					nome: {
						startsWith: nome.toUpperCase()
					}
				}
			});

			if (contribuinte) {
				await prisma.entradas.create({
					data: {
						idcontribuinte: Number(contribuinte.idleitor),
						descricao: descricao,
						valor: valor,
						data_entrada: new Date(data_entrada)
					}
				});
			} else {
				return {
					status: 400,
					field: 'nome',
					message: 'Contribuinte não encontrado'
				};
			}
		} catch (err) {
			return error(500, { message: 'Falha ao cadastrar uma nova doação' });
		}

		return {
			status: 201
		};
	}
} satisfies Actions;

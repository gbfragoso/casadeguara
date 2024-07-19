import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page') || 1);
	const nome = url.searchParams.get('contribuinte')?.toUpperCase() || undefined;
	const dataInicioString = url.searchParams.get('dataInicio') || undefined;
	const dataFimString = url.searchParams.get('dataFim') || undefined;

	let dataInicio;
	if (dataInicioString) {
		dataInicio = new Date(dataInicioString);
	}
	let dataFim;
	if (dataFimString) {
		dataFim = new Date(dataFimString);
	}

	const where = {
		data_entrada: {
			lte: dataFim,
			gte: dataInicio
		},
		contribuinte: {
			nome: {
				startsWith: nome
			}
		}
	};

	try {
		const entradas = await prisma.entradas.findMany({
			skip: (page - 1) * 10,
			take: 10,
			include: {
				contribuinte: true
			},
			where: where,
			orderBy: {
				data_entrada: 'desc'
			}
		});

		const total = await prisma.entradas.count({ where });

		return {
			entradas: JSON.parse(JSON.stringify(entradas)),
			total
		};
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a listagem de doações' });
	}
};

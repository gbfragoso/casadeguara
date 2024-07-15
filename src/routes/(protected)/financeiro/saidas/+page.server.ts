import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page') || 1);
	const descricao = url.searchParams.get('descricao') || undefined;
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

	const saidas = await prisma.saidas.findMany({
		skip: (page - 1) * 10,
		take: 10,
		where: {
			data_saida: {
				lte: dataFim,
				gte: dataInicio
			},
			descricao: {
				startsWith: descricao
			}
		}
	});
	const total = await prisma.saidas.count();

	return {
		saidas: JSON.parse(JSON.stringify(saidas)),
		total
	};
};

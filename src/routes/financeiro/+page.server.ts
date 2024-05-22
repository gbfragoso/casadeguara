import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	try {
		type ChartItem = {
			sum: number;
			month: number;
			year: number;
		};

		const entradas = await prisma.$queryRaw<
			ChartItem[]
		>`select sum(valor), extract(month from data_entrada) as month, extract(year from data_entrada) as year from entradas group by year, month order by year, month limit 12;`;

		let entradasData: number[] = [];
		let entradasIndex: string[] = [];
		entradas.forEach((element: ChartItem) => {
			entradasIndex.push(element.month + '/' + element.year);
			entradasData.push(Number(element.sum));
		});

		const saidas = await prisma.$queryRaw<
			ChartItem[]
		>`select sum(valor), extract(month from data_saida) as month, extract(year from data_saida) as year from saidas group by year, month order by year, month limit 12;`;

		let saidasData: number[] = [];
		let saidasIndex: string[] = [];
		saidas.forEach((element: ChartItem) => {
			saidasIndex.push(element.month + '/' + element.year);
			saidasData.push(Number(element.sum));
		});

		return {
			entradasData,
			entradasIndex,
			saidasData,
			saidasIndex
		};
	} catch (err) {
		return error(500, { message: 'Falha ao carregar a listagem de doações' });
	}
};

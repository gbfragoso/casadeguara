import { createPhotoReader } from '../photos.js';
import type { DepartmentPageContent } from './types.js';

const photo = createPhotoReader(
	import.meta.glob<string>('../images/departamentos/biblioteca/*.webp', {
		eager: true,
		query: '?url',
		import: 'default',
	}),
);

export const LIBRARY_PAGE: DepartmentPageContent = {
	titulo: 'Biblioteca Batuíra',
	capa: photo(
		'capa',
		'Interior da Biblioteca Batuíra, com estantes de livros dos dois lados e uma mesa com computador',
	),
	paragrafos: [
		'Com mais de 3.000 livros e 1.500 títulos em seu acervo, contendo obras de médiuns como Francisco Cândido Xavier e Divaldo Pereira Franco, a biblioteca Batuíra é uma fonte pura e rica de conhecimento moral e espiritual. Conhecimento indispensável para quem busca sua reforma íntima.',
		'Para efetuar um empréstimo é muito fácil, basta comparecer à nossa Biblioteca e efetuar um cadastro simples e rápido.',
		'Venham nos visitar e conhecer nossas novas aquisições.',
	],
	topicos: [
		{
			titulo: 'Empréstimos',
			itens: [
				'Cada empréstimo tem duração de 15 dias, sendo possível uma renovação por igual período.',
				'Cada frequentador tem direito de tomar como empréstimo, simultaneamente, até dois exemplares.',
				'Nossos empréstimos estão disponíveis para os frequentadores de Itabuna e região.',
			],
		},
	],
	agenda: {
		titulo: 'Funcionamento',
		entradas: [
			{ rotulo: 'Segunda-feira', horario: 'Das 8h às 8h50' },
			{ rotulo: 'Terça e quinta-feira', horario: 'Das 18h30 às 19h30' },
		],
	},
	coordenacao: ['biblioteca'],
	galerias: [],
	citacao: {
		texto: 'Ofereçamos nossas mãos ao trabalho e Jesus nô-las sustentará.',
		fonte: 'Batuíra in Mais Luz, Nas Tarefas da Alma, página 70',
	},
};

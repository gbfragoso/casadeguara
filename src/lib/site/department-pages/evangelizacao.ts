import { createPhotoReader } from '../photos.js';
import type { DepartmentPageContent } from './types.js';

const photo = createPhotoReader(
	import.meta.glob<string>('../images/departamentos/evangelizacao/*.webp', {
		eager: true,
		query: '?url',
		import: 'default',
	}),
);

export const CHILDREN_EVANGELIZATION_PAGE: DepartmentPageContent = {
	titulo: 'Evangelização Infantil Meimei',
	capa: photo(
		'capa',
		'Equipe da Evangelização Infantil Meimei reunida com as camisetas do departamento, segurando um grande coração vermelho',
	),
	paragrafos: [],
	topicos: [],
	agenda: {
		titulo: 'Reuniões',
		entradas: [
			{ rotulo: 'Encontro com as crianças', horario: 'Sábados, das 9h às 11h' },
			{ rotulo: 'Planejamento e avaliação', horario: 'Quartas-feiras, às 19h' },
		],
	},
	coordenacao: ['evangelizacao'],
	galerias: [
		{
			titulo: 'ECRIAR – Evangelização, Criança e Arte',
			fotos: [
				photo('ecriar-2019-01', 'Crianças em fila no palco, cada uma com um coração vermelho no peito'),
				photo('ecriar-2019-02', 'Crianças se apresentam no palco, uma delas em cadeira de rodas'),
				photo('ecriar-2019-03', 'Crianças e evangelizadores de mãos dadas no palco diante da plateia'),
				photo('ecriar-2019-04', 'Evangelizadoras no palco ao lado de um teatro de fantoches'),
				photo('ecriar-2019-05', 'Jovens encenam uma peça no palco, vestidos de preto e de branco'),
				photo('ecriar-2019-06', 'Crianças dançam no palco segurando pequenas luzes'),
				photo('ecriar-2019-07', 'Plateia assiste à apresentação, com o retrato de Meimei projetado no telão'),
				photo('ecriar-2019-08', 'Crianças pequenas dançam no palco com evangelizadores'),
				photo('ecriar-2019-09', 'Plateia de pé no salão durante o encerramento'),
				photo('ecriar-2018-01', 'Evangelizadoras cantam no palco decorado com flores coloridas'),
				photo('ecriar-2018-02', 'Salão cheio, com o público sentado assistindo à apresentação'),
				photo('ecriar-2018-03', 'Evangelizadoras e crianças cantam juntas no palco florido'),
				photo('ecriar-2018-04', 'Equipe da Evangelização reunida no palco ao fim da apresentação'),
			],
		},
	],
	citacao: null,
};

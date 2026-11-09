import type { DepartmentPageSlug } from './department-pages/slugs.js';
import type { DrawnIconName, DrawnIconTone } from './drawn-icons.js';

export type DepartmentLink = { href: '/acervo'; rotulo: string };

export type Department = {
	pagina: DepartmentPageSlug;
	icone: DrawnIconName;
	tom: DrawnIconTone;
	nome: string;
	resumo: string;
	horarios: readonly string[];
	publico: string | null;
	link: DepartmentLink | null;
};

export const DEPARTMENTS: readonly Department[] = [
	{
		pagina: 'biblioteca',
		icone: 'biblioteca',
		tom: 'sky',
		nome: 'Biblioteca Batuíra',
		resumo: 'Aberta ao público, com empréstimo de livros espíritas.',
		horarios: ['Segunda, das 8h às 8h45', 'Terça e quinta, das 19h às 19h30'],
		publico: null,
		link: { href: '/acervo', rotulo: 'Consultar o acervo' },
	},
	{
		pagina: 'manjedoura',
		icone: 'manjedoura',
		tom: 'gold',
		nome: 'Manjedoura Dr. Bezerra de Menezes',
		resumo: 'Produz os enxovais entregues às gestantes do Recanto de Potira e aceita doação de roupas.',
		horarios: ['Sexta, das 14h30 às 17h'],
		publico: 'Somente para trabalhadores',
		link: null,
	},
	{
		pagina: 'juventude',
		icone: 'jear',
		tom: 'sky',
		nome: 'Juventude Espírita Amélia Rodrigues (JEAR)',
		resumo: 'Encontros de estudo e convivência abertos a jovens.',
		horarios: ['Sábado, das 15h às 17h'],
		publico: 'A partir de 13 anos',
		link: null,
	},
	{
		pagina: 'evangelizacao',
		icone: 'evangelizacao',
		tom: 'gold',
		nome: 'Evangelização Infantil Meimei',
		resumo: 'Evangelização para crianças, com inscrição prévia.',
		horarios: ['Sábado, das 9h às 11h'],
		publico: 'De 3 a 12 anos',
		link: null,
	},
];

export const findDepartmentCard = (pagina: DepartmentPageSlug) =>
	DEPARTMENTS.find((department) => department.pagina === pagina);

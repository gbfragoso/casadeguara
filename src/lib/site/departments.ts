export type DepartmentLink = { href: '/acervo'; rotulo: string };

export type Department = {
	slug: string;
	nome: string;
	resumo: string;
	horarios: readonly string[];
	publico: string | null;
	link: DepartmentLink | null;
};

export const DEPARTMENTS: readonly Department[] = [
	{
		slug: 'biblioteca',
		nome: 'Biblioteca Batuíra',
		resumo: 'Aberta ao público, com empréstimo de livros espíritas.',
		horarios: ['Segunda, das 8h às 8h45', 'Terça e quinta, das 19h às 19h30'],
		publico: null,
		link: { href: '/acervo', rotulo: 'Consultar o acervo' },
	},
	{
		slug: 'manjedoura',
		nome: 'Manjedoura Dr. Bezerra de Menezes',
		resumo: 'Produz os enxovais entregues às gestantes do Recanto de Potira e aceita doação de roupas.',
		horarios: [],
		publico: null,
		link: null,
	},
	{
		slug: 'jear',
		nome: 'Juventude Espírita Amélia Rodrigues (JEAR)',
		resumo: 'Encontros de estudo e convivência abertos a jovens.',
		horarios: ['Sábado, das 15h às 17h'],
		publico: 'Acima de 13 anos',
		link: null,
	},
	{
		slug: 'evangelizacao',
		nome: 'Evangelização Infantil Meimei',
		resumo: 'Evangelização para crianças, com inscrição prévia.',
		horarios: ['Sábado, das 9h às 11h'],
		publico: 'De 3 a 12 anos',
		link: null,
	},
];

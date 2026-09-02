const createTombo = (token: string, offset: number) => {
	const digits = [...token]
		.map((character) => character.charCodeAt(0) % 10)
		.join('')
		.slice(0, 7);
	const base = Number(digits) || 1_000_000;
	return `${(base + offset).toString().padStart(8, '0')}`;
};

export type BookKey = 'primary' | 'secondary' | 'related' | 'unrelated';
export type BookDefinition = {
	key: BookKey;
	tombo: string;
	titulo: string;
	publisherIndex: number;
	collectionIndex: number;
	ordem: number;
	authorIndex?: number;
	keywords: { keywordIndex: number; referencia: string }[];
	hasExemplar?: boolean;
};

export type LivroCatalogDefinition = {
	token: string;
	editora: string[];
	colecao: string[];
	autor: string[];
	keyword: string[];
	livros: BookDefinition[];
};

export const createLivroCatalogDefinition = (token: string): LivroCatalogDefinition => {
	const suffix = token.toUpperCase();
	return {
		token,
		editora: [`Editora Êxito ${suffix}`, `Editora Zênite ${suffix}`],
		colecao: [`Coleção Azul ${suffix}`, `Coleção Verde ${suffix}`],
		autor: [`Érico Autor ${suffix}`, `Zélia Autora ${suffix}`],
		keyword: [`Ação ${suffix}`, `História ${suffix}`],
		livros: [
			{
				key: 'primary',
				tombo: createTombo(token, 1),
				titulo: `Árvore Azul ${suffix}`,
				publisherIndex: 0,
				collectionIndex: 0,
				ordem: 1,
				authorIndex: 0,
				keywords: [{ keywordIndex: 0, referencia: 'capítulo inicial' }],
			},
			{
				key: 'secondary',
				tombo: createTombo(token, 2),
				titulo: `Aquarela Amarela ${suffix}`,
				publisherIndex: 0,
				collectionIndex: 0,
				ordem: 2,
				authorIndex: 1,
				keywords: [{ keywordIndex: 1, referencia: 'quarta capa' }],
			},
			{
				key: 'related',
				tombo: createTombo(token, 3),
				titulo: `Livro Relacionado ${suffix}`,
				publisherIndex: 1,
				collectionIndex: 1,
				ordem: 1,
				authorIndex: 1,
				keywords: [{ keywordIndex: 0, referencia: 'índice remissivo' }],
				hasExemplar: true,
			},
			{
				key: 'unrelated',
				tombo: createTombo(token, 4),
				titulo: `Livro Distante ${suffix}`,
				publisherIndex: 1,
				collectionIndex: 1,
				ordem: 2,
				keywords: [],
			},
		],
	};
};

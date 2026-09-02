import { authorName, bookTitle, keywordName, publisherName } from './labels';
import { entityIdWithDegree, profile } from './profile';
import type { LegacyBookSearchInput } from '$lib/server/models/livro-search';
import type { LivroSearchInput } from '$lib/validation/livro';

export type BookPerformanceScenario = {
	name: string;
	selectivity: 'high' | 'low' | 'mixed';
	input: LegacyBookSearchInput | LivroSearchInput;
	expectedRows: { min: number; max: number };
};

const EMPTY_INPUT: LegacyBookSearchInput = {
	tombo: '',
	titulo: '',
	editora: '',
	colecao: '',
	keyword: '',
	autor: '',
};

const scenario = (
	name: string,
	selectivity: BookPerformanceScenario['selectivity'],
	input: Partial<LegacyBookSearchInput>,
	min: number,
	max = min,
): BookPerformanceScenario => ({ name, selectivity, input: { ...EMPTY_INPUT, ...input }, expectedRows: { min, max } });

const preciseAuthorId = entityIdWithDegree(profile.histograms.booksPerAuthor, 1);
const precisePublisherId = entityIdWithDegree(profile.histograms.booksPerPublisher, 1);
const preciseCollectionId = entityIdWithDegree(profile.histograms.booksPerCollection, 2);
const preciseKeywordId = entityIdWithDegree(profile.histograms.booksPerKeyword, 1);

export const bookPerformanceScenarios: BookPerformanceScenario[] = [
	scenario('sem-filtro', 'low', {}, 50),
	scenario('tombo-existente', 'high', { tombo: '1' }, 1),
	scenario('tombo-ausente', 'high', { tombo: '99999999' }, 0),
	scenario('titulo-prefixo-amplo', 'low', { titulo: 'titulo' }, 50),
	scenario('titulo-exato', 'high', { titulo: bookTitle(1) }, 1),
	scenario('autor-prefixo-amplo', 'low', { autor: 'autor' }, 50),
	scenario('autor-exato', 'high', { autor: authorName(preciseAuthorId) }, 1),
	scenario('editora-prefixo-amplo', 'low', { editora: 'editora' }, 50),
	scenario('editora-exata', 'high', { editora: publisherName(precisePublisherId) }, 1),
	scenario('colecao-ampla', 'low', { colecao: '1' }, 17),
	scenario('colecao-restrita', 'high', { colecao: String(preciseCollectionId) }, 2),
	scenario('keyword-prefixo-amplo', 'low', { keyword: 'chave' }, 50),
	scenario('keyword-exata', 'high', { keyword: keywordName(preciseKeywordId) }, 1),
	scenario(
		'todos-os-filtros',
		'mixed',
		{
			tombo: '1',
			titulo: bookTitle(1),
			editora: publisherName(1),
			colecao: '1',
			keyword: keywordName(1),
			autor: authorName(1),
		},
		1,
	),
	scenario('joins-maior-cardinalidade', 'low', { editora: 'editora', autor: 'autor', keyword: 'chave' }, 1, 50),
];

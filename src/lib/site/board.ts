import statuteUrl from './documents/estatuto-gecg-2023.pdf?url';
import { createPhotoReader } from './photos.js';

export type BoardMember = { cargo: string; nome: string };

export type BoardGroup = { titulo: string; membros: readonly BoardMember[] };

const boardGroup = (titulo: string, ...membros: [cargo: string, nome: string][]): BoardGroup => ({
	titulo,
	membros: membros.map(([cargo, nome]) => ({ cargo, nome })),
});

const photo = createPhotoReader(
	import.meta.glob<string>('./images/diretoria/*.webp', { eager: true, query: '?url', import: 'default' }),
);

export const BOARD_PERIOD = 'maio 2023 a maio 2025';

export const BOARD_COVER = photo(
	'fachada',
	'Fachada azul da sede do Grupo Espírita Casa de Guará, com o nome da instituição e uma cruz.',
);

export const BOARD_STATUTE = {
	rotulo: 'Estatuto do Grupo Espírita Casa de Guará',
	tamanho: '2,9 MB',
	href: statuteUrl,
};

export const BOARD_OFFICES: readonly BoardGroup[] = [
	boardGroup(
		'Presidência',
		['Presidente de Honra (in memoriam)', 'Ary Quadros Teixeira'],
		['Presidente de Honra', 'José Lúcio Campos Silva'],
		['Presidente', 'Carlson Lemos Xavier'],
		['Vice-presidente', 'Patrick Pires da Costa'],
	),
	boardGroup(
		'Secretaria',
		['1º Secretário', 'Pery Amorim Teixeira'],
		['2º Secretário', 'Francisco de Assis Nicácio Henrique'],
	),
	boardGroup(
		'Tesouraria',
		['1º Tesoureiro', 'Victor Hugo Lionel de Souza Guimarães'],
		['2º Tesoureiro', 'Sebastião Azevedo Neves'],
	),
	boardGroup('Supervisão Geral de todas as Coordenações', ['Supervisora', 'Carmélia Amorim Teixeira']),
];

export const BOARD_COORDINATIONS = {
	manjedoura: boardGroup(
		'Manjedoura Dr. Bezerra de Menezes',
		['Coordenadora', 'Clédna Actes Bittencourt'],
		['Coordenadora Adjunta', 'Rita de Cássia Rodrigues da Paixão'],
	),
	juventude: boardGroup(
		'Juventude Espírita Amélia Rodrigues',
		['Coordenadora', 'Fabíola Queiroz dos Santos'],
		['Coordenadora Adjunta', 'Ana Paula Serra Lopes'],
	),
	evangelizacao: boardGroup(
		'Evangelização Infantil Meimei',
		['Coordenadora', 'Luzinete Rodrigues Santos Maciel'],
		['Coordenadora Adjunta', 'Márcia Alessandra Souza Guimarães'],
	),
	biblioteca: boardGroup(
		'Biblioteca Batuíra',
		['Coordenador', 'Clébio Medeiros Fragoso'],
		['Coordenadora Adjunta', 'Nilza Maria Almeida Silva Alves'],
	),
	recanto: boardGroup(
		'Recanto de Potira – Núcleo de Promoção Social para Gestantes',
		['Coordenador Geral', 'Pery Amorim Teixeira'],
		['Coordenadora Adjunta', 'Sandra Valéria Cordeiro Costa'],
	),
	'recanto-promocao-social': boardGroup(
		'Área de Promoção Social',
		['Coordenadora', 'Jéssica Pires Almeida'],
		['Coordenadora Adjunta', 'Arlete Victória de Mello Brandão'],
	),
	'recanto-saude-juridica': boardGroup(
		'Área de Saúde e de Orientação Jurídica',
		['Coordenadora', 'Andréa Carla Barreto Ferreira'],
		['Coordenadora Adjunta', 'Thiara Carvalho Lisboa da Santana de Lima'],
	),
	'comunicacao-social': boardGroup(
		'Núcleo de Comunicação Social',
		['Coordenador', 'Artur Olsen Silva Côrtes'],
		['Coordenadora Adjunta', 'Jamile de Andrade Barros'],
	),
} as const satisfies Record<string, BoardGroup>;

export type CoordinationKey = keyof typeof BOARD_COORDINATIONS;

export const BOARD_NAME_LISTS: readonly { titulo: string; nomes: readonly string[] }[] = [
	{
		titulo: 'Assessores da Diretoria',
		nomes: [
			'Edmundo Fernandes da Silva',
			'Gilenilda Maria dos Reis Sacramento',
			'Iracema Quadros Teixeira',
			'Mariana Duarte Alcântara Teixeira',
			'Marvione Santos Oliveira Xavier',
			'Renata Andrade Santana da Costa',
		],
	},
	{
		titulo: 'Conselho Fiscal',
		nomes: ['Inaiá Amorim Teixeira', 'José Carlos Silva dos Santos', 'Marcelo Cesar Santos Vicente'],
	},
];

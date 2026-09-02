import { z } from 'zod';

import { authorSchema } from './autor';

export const BOOK_TOMBO_MAX_LENGTH = 8;
export const BOOK_TITLE_MAX_LENGTH = 80;
export const BOOK_SEARCH_AUTHOR_MAX_LENGTH = 60;
export const BOOK_SEARCH_PUBLISHER_MAX_LENGTH = 60;
export const BOOK_KEYWORD_MAX_LENGTH = 30;
export const BOOK_SMALLINT_MAX = 32767;

const LETTER_PATTERN = /\p{L}/u;
const REQUIRED_TOMBO_MESSAGE = 'Tombo é obrigatório.';
const INVALID_TOMBO_MESSAGE = 'Tombo deve conter de 1 a 8 dígitos.';
const REQUIRED_TITLE_MESSAGE = 'Título da obra é obrigatório.';
const INVALID_TITLE_MESSAGE = 'Título da obra deve conter ao menos uma letra.';
const INVALID_REFERENCE_MESSAGE = 'Referência inválida.';
const INVALID_COLLECTION_MESSAGE = 'Coleção inválida.';
const INVALID_AUTHOR_MESSAGE = 'Autor inválido.';
const REQUIRED_AUTHOR_MESSAGE = 'Selecione ou cadastre ao menos um autor.';
const INVALID_IDENTIFIER_MESSAGE = 'Identificador do livro inválido.';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const mapAliases = (value: unknown, aliases: Record<string, string>): unknown => {
	if (!isRecord(value)) return value;

	const normalized = { ...value };
	Object.entries(aliases).forEach(([alias, field]) => {
		if (!(field in normalized) && alias in normalized) normalized[field] = normalized[alias];
		delete normalized[alias];
	});
	return normalized;
};

const optionalText = (maxLength: number, field: string) =>
	z.preprocess(
		(value) => (typeof value === 'string' ? value.trim() || undefined : value),
		z
			.string({ error: `${field} inválido.` })
			.max(maxLength, `${field} excede o limite de caracteres.`)
			.optional(),
	);

const identifier = (message: string) =>
	z.preprocess(
		(value) => {
			if (typeof value === 'string') return value.trim() === '' ? undefined : Number(value);
			return value;
		},
		z.number({ error: message }).int(message).positive(message).max(BOOK_SMALLINT_MAX, message).optional(),
	);

const requiredIdentifier = (message: string) =>
	z.preprocess(
		(value) => {
			if (typeof value === 'string') return value.trim() === '' ? undefined : Number(value);
			return value;
		},
		z.number({ error: message }).int(message).positive(message).max(BOOK_SMALLINT_MAX, message),
	);

const optionalTombo = z.preprocess(
	(value) => (typeof value === 'string' ? value.trim() || undefined : value),
	z
		.string({ error: INVALID_TOMBO_MESSAGE })
		.regex(/^\d{1,8}$/, INVALID_TOMBO_MESSAGE)
		.optional(),
);

const requiredTombo = z
	.string({ error: (issue) => (issue.input === undefined ? REQUIRED_TOMBO_MESSAGE : INVALID_TOMBO_MESSAGE) })
	.trim()
	.min(1, REQUIRED_TOMBO_MESSAGE)
	.max(BOOK_TOMBO_MAX_LENGTH, INVALID_TOMBO_MESSAGE)
	.regex(/^\d+$/, INVALID_TOMBO_MESSAGE);

const searchText = (maxLength: number, field: string) => optionalText(maxLength, field);

const searchShape = {
	tombo: optionalTombo,
	titulo: searchText(BOOK_TITLE_MAX_LENGTH, 'Título'),
	autor: searchText(BOOK_SEARCH_AUTHOR_MAX_LENGTH, 'Autor'),
	editora: searchText(BOOK_SEARCH_PUBLISHER_MAX_LENGTH, 'Editora'),
	colecaoId: identifier(INVALID_COLLECTION_MESSAGE),
	keyword: searchText(BOOK_KEYWORD_MAX_LENGTH, 'Palavra-chave'),
};

export const livroSearchSchema = z.preprocess(
	(value) => mapAliases(value, { colecao: 'colecaoId', serie: 'colecaoId' }),
	z.strictObject(searchShape, 'Dados de pesquisa inválidos.'),
);

const title = z
	.string({ error: REQUIRED_TITLE_MESSAGE })
	.trim()
	.min(1, REQUIRED_TITLE_MESSAGE)
	.max(BOOK_TITLE_MAX_LENGTH, 'Título da obra excede o limite de caracteres.')
	.refine((value) => LETTER_PATTERN.test(value), INVALID_TITLE_MESSAGE);

const authorIds = z.preprocess(
	(value) => (Array.isArray(value) ? value : value === undefined ? [] : [value]),
	z.array(requiredIdentifier(INVALID_AUTHOR_MESSAGE)).transform((values) => [...new Set(values)]),
);

const newAuthor = z.preprocess(
	(value) => (typeof value === 'string' ? (value.trim() ? { nome: value } : undefined) : value),
	authorSchema.transform(({ nome }) => nome).optional(),
);

export const livroCreateSchema = z.preprocess(
	(value) =>
		mapAliases(value, { editora: 'editoraId', colecao: 'colecaoId', serie: 'colecaoId', autores: 'autorIds' }),
	z
		.strictObject(
			{
				tombo: requiredTombo,
				titulo: title,
				editoraId: requiredIdentifier(INVALID_REFERENCE_MESSAGE),
				colecaoId: identifier(INVALID_COLLECTION_MESSAGE),
				ordem: identifier('Ordem inválida.'),
				autorIds: authorIds,
				novoAutor: newAuthor,
			},
			'Dados de cadastro inválidos.',
		)
		.refine((value) => value.ordem === undefined || value.colecaoId !== undefined, {
			message: 'Ordem exige uma coleção.',
			path: ['ordem'],
		})
		.refine((value) => value.autorIds.length > 0 || value.novoAutor !== undefined, {
			message: REQUIRED_AUTHOR_MESSAGE,
			path: ['autorIds'],
		}),
);

export const livroDeleteSchema = z.preprocess(
	(value) => mapAliases(value, { id: 'idlivro' }),
	z.strictObject({ idlivro: requiredIdentifier(INVALID_IDENTIFIER_MESSAGE) }, 'Identificador do livro inválido.'),
);

export type LivroSearchInput = z.output<typeof livroSearchSchema>;
export type LivroCreateInput = z.output<typeof livroCreateSchema>;
export type LivroDeleteInput = z.output<typeof livroDeleteSchema>;

export const bookSearchSchema = livroSearchSchema;
export const bookCreateSchema = livroCreateSchema;
export const bookDeleteSchema = livroDeleteSchema;

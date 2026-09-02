import type { LivroListItem } from '$lib/server/models/livro';

export type LivroFormErrors = Record<string, string[] | undefined>;
export type LivroFormValues = Record<string, string | string[]>;
export type LivroFormOutcome = 'created' | 'deleted';

export type LivroFormState = {
	values?: LivroFormValues;
	errors?: LivroFormErrors;
	livros?: LivroListItem[];
	outcome?: LivroFormOutcome;
	message?: string;
};

const SEARCH_FIELDS = ['tombo', 'titulo', 'autor', 'editora', 'serie', 'colecao', 'keyword'];
const CREATE_FIELDS = ['tombo', 'titulo', 'editora', 'colecao', 'ordem', 'novoAutor'];
const ERROR_FIELDS = [
	...SEARCH_FIELDS,
	...CREATE_FIELDS,
	'autores',
	'autorIds',
	'editoraId',
	'colecaoId',
	'idlivro',
	'form',
];

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const toRecord = (value: unknown): Record<string, unknown> => {
	if (typeof FormData !== 'undefined' && value instanceof FormData) return Object.fromEntries(value.entries());
	return isRecord(value) ? value : {};
};

const pickStringValues = (value: unknown, fields: string[]): LivroFormValues => {
	const source = toRecord(value);
	return Object.fromEntries(fields.map((field) => [field, typeof source[field] === 'string' ? source[field] : '']));
};

const pickStringList = (value: unknown, field: string): string[] => {
	if (typeof FormData !== 'undefined' && value instanceof FormData) {
		return value.getAll(field).filter((item): item is string => typeof item === 'string');
	}
	const candidate = toRecord(value)[field];
	if (Array.isArray(candidate)) return candidate.filter((item): item is string => typeof item === 'string');
	return typeof candidate === 'string' ? [candidate] : [];
};

export const getLivroSearchValues = (value: unknown): LivroFormValues => pickStringValues(value, SEARCH_FIELDS);

export const getLivroFormValues = (value: unknown): LivroFormValues => ({
	...pickStringValues(value, CREATE_FIELDS),
	autores: pickStringList(value, 'autores'),
});

export const getLivroErrors = (value: unknown): LivroFormErrors => {
	const source = toRecord(value);
	return Object.fromEntries(
		ERROR_FIELDS.flatMap((field) => {
			const messages = source[field];
			if (!Array.isArray(messages)) return [];
			const safeMessages = messages.filter((message): message is string => typeof message === 'string');
			return safeMessages.length > 0 ? [[field, safeMessages]] : [];
		}),
	);
};

const FORM_ERROR_ALIASES: Record<string, string> = {
	editoraId: 'editora',
	colecaoId: 'colecao',
	autorIds: 'autores',
};

export const getLivroActionErrors = (value: unknown): LivroFormErrors => {
	const errors = getLivroErrors(value);
	return Object.fromEntries(
		Object.entries(errors).map(([field, messages]) => [FORM_ERROR_ALIASES[field] ?? field, messages]),
	);
};

export const getBookSearchValues = getLivroSearchValues;
export const getBookFormValues = getLivroFormValues;
export const getBookErrors = getLivroErrors;

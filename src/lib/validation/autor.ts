import { z } from 'zod';

export const AUTHOR_NAME_MAX_LENGTH = 60;

const REQUIRED_NAME_MESSAGE = 'Nome do autor é obrigatório.';
const INVALID_NAME_MESSAGE = 'Nome do autor inválido.';
const MAX_NAME_LENGTH_MESSAGE = 'Nome do autor excede o limite de caracteres.';
const LETTER_PATTERN = /\p{L}/u;

const createNameSchema = z
	.string({
		error: (issue) =>
			issue.input === undefined || issue.input === null ? REQUIRED_NAME_MESSAGE : INVALID_NAME_MESSAGE,
	})
	.trim()
	.min(1, REQUIRED_NAME_MESSAGE)
	.max(AUTHOR_NAME_MAX_LENGTH, MAX_NAME_LENGTH_MESSAGE)
	.refine((name) => name === '' || LETTER_PATTERN.test(name), INVALID_NAME_MESSAGE)
	.transform((name) => name.toLocaleUpperCase('pt-BR'));

const searchNameSchema = z
	.string({ error: INVALID_NAME_MESSAGE })
	.trim()
	.max(AUTHOR_NAME_MAX_LENGTH, MAX_NAME_LENGTH_MESSAGE)
	.refine((name) => name === '' || LETTER_PATTERN.test(name), INVALID_NAME_MESSAGE);

export const authorSchema = z.object({ nome: createNameSchema });
export const authorSearchSchema = z.object({ nome: searchNameSchema });

export type AuthorInput = z.infer<typeof authorSchema>;
export type AuthorSearchInput = z.infer<typeof authorSearchSchema>;

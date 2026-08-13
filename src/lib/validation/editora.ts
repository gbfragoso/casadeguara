import { z } from 'zod';

export const PUBLISHER_NAME_MAX_LENGTH = 60;

const REQUIRED_NAME_MESSAGE = 'Nome da editora é obrigatório.';
const INVALID_NAME_MESSAGE = 'Nome da editora inválido.';
const MAX_NAME_LENGTH_MESSAGE = 'Nome da editora excede o limite de caracteres.';
const LETTER_PATTERN = /\p{L}/u;

const createNameSchema = z
	.string({
		error: (issue) =>
			issue.input === undefined || issue.input === null ? REQUIRED_NAME_MESSAGE : INVALID_NAME_MESSAGE,
	})
	.trim()
	.min(1, REQUIRED_NAME_MESSAGE)
	.max(PUBLISHER_NAME_MAX_LENGTH, MAX_NAME_LENGTH_MESSAGE)
	.refine((name) => name === '' || LETTER_PATTERN.test(name), INVALID_NAME_MESSAGE)
	.transform((name) => name.toLocaleUpperCase('pt-BR'));

const searchNameSchema = z
	.string({ error: INVALID_NAME_MESSAGE })
	.trim()
	.max(PUBLISHER_NAME_MAX_LENGTH, MAX_NAME_LENGTH_MESSAGE)
	.refine((name) => name === '' || LETTER_PATTERN.test(name), INVALID_NAME_MESSAGE);

export const editoraSchema = z.object({ nome: createNameSchema });
export const editoraSearchSchema = z.object({ nome: searchNameSchema });

export type EditoraInput = z.infer<typeof editoraSchema>;
export type EditoraSearchInput = z.infer<typeof editoraSearchSchema>;

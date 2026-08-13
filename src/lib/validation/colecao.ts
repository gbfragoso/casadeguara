import { z } from 'zod';

export const COLLECTION_NAME_MAX_LENGTH = 60;

const REQUIRED_MESSAGE = 'Nome da coleção é obrigatório.';
const INVALID_MESSAGE = 'Nome da coleção inválido.';
const MAX_LENGTH_MESSAGE = 'Nome da coleção excede o limite de caracteres.';
const LETTER_PATTERN = /\p{L}/u;

const collectionNameSchema = z
	.string({
		error: (issue) => (issue.input === undefined || issue.input === null ? REQUIRED_MESSAGE : INVALID_MESSAGE),
	})
	.trim()
	.min(1, REQUIRED_MESSAGE)
	.max(COLLECTION_NAME_MAX_LENGTH, MAX_LENGTH_MESSAGE)
	.refine((name) => name === '' || LETTER_PATTERN.test(name), INVALID_MESSAGE)
	.transform((name) => name.toLocaleUpperCase('pt-BR'));

const collectionSearchSchema = z
	.string({ error: INVALID_MESSAGE })
	.trim()
	.max(COLLECTION_NAME_MAX_LENGTH, MAX_LENGTH_MESSAGE)
	.refine((name) => name === '' || LETTER_PATTERN.test(name), INVALID_MESSAGE);

export const colecaoSchema = z.object({ nome: collectionNameSchema });
export const colecaoSearchSchema = z.object({ nome: collectionSearchSchema });

export type ColecaoInput = z.infer<typeof colecaoSchema>;
export type ColecaoSearchInput = z.infer<typeof colecaoSearchSchema>;

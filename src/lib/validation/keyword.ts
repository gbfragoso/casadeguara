import { z } from 'zod';

export const KEYWORD_MAX_LENGTH = 30;

const REQUIRED_MESSAGE = 'Palavra-chave é obrigatória.';
const INVALID_MESSAGE = 'Palavra-chave inválida.';
const MAX_LENGTH_MESSAGE = 'Palavra-chave excede o limite de caracteres.';
const LETTER_PATTERN = /\p{L}/u;

const createKeywordSchema = z
	.string({
		error: (issue) => (issue.input === undefined || issue.input === null ? REQUIRED_MESSAGE : INVALID_MESSAGE),
	})
	.trim()
	.min(1, REQUIRED_MESSAGE)
	.max(KEYWORD_MAX_LENGTH, MAX_LENGTH_MESSAGE)
	.refine((key) => key === '' || LETTER_PATTERN.test(key), INVALID_MESSAGE)
	.transform((key) => key.toLocaleUpperCase('pt-BR'));

const searchKeywordSchema = z
	.string({ error: INVALID_MESSAGE })
	.trim()
	.max(KEYWORD_MAX_LENGTH, MAX_LENGTH_MESSAGE)
	.refine((key) => key === '' || LETTER_PATTERN.test(key), INVALID_MESSAGE);

export const keywordSchema = z.object({ chave: createKeywordSchema });
export const keywordSearchSchema = z.object({ chave: searchKeywordSchema });

export type KeywordInput = z.infer<typeof keywordSchema>;
export type KeywordSearchInput = z.infer<typeof keywordSearchSchema>;

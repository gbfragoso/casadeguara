import { z } from 'zod';

export const AUTHOR_NAME_MAX_LENGTH = 60;

const REQUIRED = 'Nome do autor é obrigatório.';
const INVALID = 'Nome do autor inválido.';
const TOO_LONG = 'Nome do autor excede o limite de caracteres.';
const hasLetter = (name: string) => name.length === 0 || /\p{L}/u.test(name);
const nameInput = z.string({ error: INVALID }).transform((name) => name.trim());

const nameRules = z
	.string()
	.min(1, { error: REQUIRED })
	.max(AUTHOR_NAME_MAX_LENGTH, { error: TOO_LONG })
	.refine(hasLetter, { error: INVALID });

export const autorSchema = z.object({
	nome: nameInput.pipe(nameRules).transform((name) => name.toLocaleUpperCase('pt-BR')),
});

export const autorSearchSchema = z.object({
	nome: nameInput.pipe(
		z.string().max(AUTHOR_NAME_MAX_LENGTH, { error: TOO_LONG }).refine(hasLetter, { error: INVALID }),
	),
});

export type AutorInput = z.infer<typeof autorSchema>;
export type AutorSearchInput = z.infer<typeof autorSearchSchema>;

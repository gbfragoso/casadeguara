import { ACCESS_LEVEL_VALUES, hasAnyAccess, mapSystemModules } from '#lib/users/access.js';
import { z } from 'zod';

const USERNAME_MAX_LENGTH = 30;
const NAME_MAX_LENGTH = 255;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 255;

const INVALID_USERNAME_MESSAGE = 'E-mail inválido';
const USERNAME_TOO_LONG_MESSAGE = 'E-mail excede o limite de 30 caracteres.';
const REQUIRED_NAME_MESSAGE = 'Nome é obrigatório.';
const NAME_TOO_LONG_MESSAGE = 'Nome excede o limite de caracteres.';
const INVALID_PASSWORD_MESSAGE = 'Senha não atende aos requisitos mínimos de segurança';
const INVALID_ACCESS_MESSAGE = 'Nível de acesso inválido.';
const REQUIRED_ACCESS_MESSAGE = 'Escolha ao menos um acesso: um módulo ou a opção de superusuário.';

const username = z
	.string({ error: INVALID_USERNAME_MESSAGE })
	.trim()
	.toLowerCase()
	.pipe(z.email(INVALID_USERNAME_MESSAGE).max(USERNAME_MAX_LENGTH, USERNAME_TOO_LONG_MESSAGE));

const name = z
	.string({ error: REQUIRED_NAME_MESSAGE })
	.trim()
	.min(1, REQUIRED_NAME_MESSAGE)
	.max(NAME_MAX_LENGTH, NAME_TOO_LONG_MESSAGE);

const password = z
	.string({ error: INVALID_PASSWORD_MESSAGE })
	.min(PASSWORD_MIN_LENGTH, INVALID_PASSWORD_MESSAGE)
	.max(PASSWORD_MAX_LENGTH, INVALID_PASSWORD_MESSAGE);

const optionalPassword = z.preprocess((value) => (value === '' ? undefined : value), password.optional());

const access = z.object(
	{
		modules: z.object(mapSystemModules(() => z.enum(ACCESS_LEVEL_VALUES, INVALID_ACCESS_MESSAGE))),
		superuser: z.boolean(INVALID_ACCESS_MESSAGE),
	},
	INVALID_ACCESS_MESSAGE,
);

export const createUserAccountSchema = z.object({
	username,
	name,
	password,
	access: access.refine(hasAnyAccess, REQUIRED_ACCESS_MESSAGE),
});

export const editUserAccountSchema = z.object({ username, name, password: optionalPassword, access });

export type UserAccountInput = z.infer<typeof editUserAccountSchema>;

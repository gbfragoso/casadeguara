import { describe, expect, it } from 'vitest';

import { createUserAccountSchema, editUserAccountSchema } from '#lib/validation/user-account.js';
import { getFieldErrors } from './field-errors';

const NO_ACCESS = { biblioteca: 'none', secretaria: 'none', tesouraria: 'none', comunicacao: 'none' };
const REQUIRED_ACCESS = 'Escolha ao menos um acesso: um módulo ou a opção de superusuário.';

const createInput = (overrides: Record<string, unknown> = {}) => ({
	username: 'ana.souza@exemplo.dev',
	name: 'Ana Souza',
	password: 'senha-segura',
	access: { modules: { ...NO_ACCESS, secretaria: 'volunteer' }, superuser: false },
	...overrides,
});

describe('createUserAccountSchema', () => {
	it('TU-05 accepts a valid form and normalizes the login', () => {
		const input = createInput({ username: '  Ana.Souza@Exemplo.dev ', name: ' Ana Souza ' });

		const result = createUserAccountSchema.safeParse(input);

		expect(result).toMatchObject({
			success: true,
			data: { username: 'ana.souza@exemplo.dev', name: 'Ana Souza', password: 'senha-segura' },
		});
	});

	it('accepts the superuser option as the only access', () => {
		const input = createInput({ access: { modules: NO_ACCESS, superuser: true } });

		const result = createUserAccountSchema.safeParse(input);

		expect(result.success).toBe(true);
	});

	it('TU-06 rejects an account without any access', () => {
		const input = createInput({ access: { modules: NO_ACCESS, superuser: false } });

		const result = createUserAccountSchema.safeParse(input);

		expect(getFieldErrors(result)?.access).toEqual([REQUIRED_ACCESS]);
	});

	it('TU-07 rejects a login that is not an e-mail and a short password with the current messages', () => {
		const input = createInput({ username: 'ana.souza', password: '12345' });

		const result = createUserAccountSchema.safeParse(input);

		expect(getFieldErrors(result)).toMatchObject({
			username: ['E-mail inválido'],
			password: ['Senha não atende aos requisitos mínimos de segurança'],
		});
	});

	it('rejects a login longer than 30 characters', () => {
		const input = createInput({ username: `${'a'.repeat(20)}@exemplo.dev` });

		const result = createUserAccountSchema.safeParse(input);

		expect(getFieldErrors(result)?.username).toEqual(['E-mail excede o limite de 30 caracteres.']);
	});

	it('rejects a blank name', () => {
		const input = createInput({ name: '   ' });

		const result = createUserAccountSchema.safeParse(input);

		expect(getFieldErrors(result)?.name).toEqual(['Nome é obrigatório.']);
	});

	it('rejects an unknown access level', () => {
		const input = createInput({ access: { modules: { ...NO_ACCESS, tesouraria: 'admin' }, superuser: false } });

		const result = createUserAccountSchema.safeParse(input);

		expect(getFieldErrors(result)?.access).toEqual(['Nível de acesso inválido.']);
	});
});

describe('editUserAccountSchema', () => {
	it('TU-08 treats a blank password as absent and accepts an account without access', () => {
		const input = createInput({ password: '', access: { modules: NO_ACCESS, superuser: false } });

		const result = editUserAccountSchema.safeParse(input);

		expect(result.success).toBe(true);
		expect(result.data?.password).toBeUndefined();
	});

	it('rejects a short new password', () => {
		const input = createInput({ password: '123' });

		const result = editUserAccountSchema.safeParse(input);

		expect(getFieldErrors(result)?.password).toEqual(['Senha não atende aos requisitos mínimos de segurança']);
	});
});

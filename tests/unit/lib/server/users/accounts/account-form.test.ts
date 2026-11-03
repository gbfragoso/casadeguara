import { describe, expect, it } from 'vitest';

import { parseUserAccountForm } from '#lib/server/users/accounts/account-form.js';

const createFormData = (fields: Record<string, string>) => {
	const formData = new FormData();
	Object.entries(fields).forEach(([field, value]) => formData.append(field, value));
	return formData;
};

const VALID_FIELDS = {
	username: 'Ana.Souza@Exemplo.dev',
	name: 'Ana Souza',
	password: 'senha-segura',
	'access-secretaria': 'volunteer',
	'access-tesouraria': 'coordination',
};

describe('parseUserAccountForm', () => {
	it('treats missing access groups as no access and reads the superuser checkbox', () => {
		const formData = createFormData({ ...VALID_FIELDS, superuser: 'on' });

		const result = parseUserAccountForm(formData, 'create');

		expect(result).toEqual({
			success: true,
			data: {
				username: 'ana.souza@exemplo.dev',
				name: 'Ana Souza',
				password: 'senha-segura',
				access: {
					modules: {
						biblioteca: 'none',
						secretaria: 'volunteer',
						tesouraria: 'coordination',
						comunicacao: 'none',
					},
					superuser: true,
				},
			},
		});
	});

	it('requires an access when creating an account', () => {
		const formData = createFormData({ username: 'ana@exemplo.dev', name: 'Ana', password: 'senha-segura' });

		const result = parseUserAccountForm(formData, 'create');

		expect(result).toMatchObject({
			success: false,
			failure: { errors: { access: ['Escolha ao menos um acesso: um módulo ou a opção de superusuário.'] } },
		});
	});

	it('accepts an edit without password and without access', () => {
		const formData = createFormData({ username: 'ana@exemplo.dev', name: 'Ana', password: '' });

		const result = parseUserAccountForm(formData, 'edit');

		expect(result).toMatchObject({ success: true, data: { password: undefined } });
	});

	it('returns the typed values without the password and maps unknown access levels to none', () => {
		const formData = createFormData({ ...VALID_FIELDS, 'access-comunicacao': 'admin' });

		const result = parseUserAccountForm(formData, 'edit');

		expect(result).toEqual({
			success: false,
			failure: {
				values: {
					username: 'Ana.Souza@Exemplo.dev',
					name: 'Ana Souza',
					access: {
						modules: {
							biblioteca: 'none',
							secretaria: 'volunteer',
							tesouraria: 'coordination',
							comunicacao: 'none',
						},
						superuser: false,
					},
				},
				errors: { access: ['Nível de acesso inválido.'] },
			},
		});
	});

	it('returns empty values for missing text fields', () => {
		const formData = createFormData({ 'access-biblioteca': 'volunteer' });

		const result = parseUserAccountForm(formData, 'create');

		expect(result).toMatchObject({
			success: false,
			failure: {
				values: { username: '', name: '' },
				errors: { username: ['E-mail inválido'], name: ['Nome é obrigatório.'] },
			},
		});
	});
});

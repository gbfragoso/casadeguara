import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/comunicacao/usuarios/[id=alphanumeric]/+page.svelte';
import { describeUserFormPage, renderUserFormPage } from '../../../../support/user-form-page-suite';
import { getRenderedInput, getRenderedSelect } from '../../../../support/rendered-document';

const data = { usuario: { username: 'rui@exemplo.dev', name: 'Rui Souza', roles: 'comunicacao:admin' } };

describe('comunicacao user edit page', () => {
	describeUserFormPage({
		page: Page,
		data,
		fields: ['username', 'password', 'name', 'roles'],
		successStatus: 200,
		successMessage: 'Usuário atualizado com sucesso!',
	});

	it('fills the form with the current user', () => {
		const document = renderUserFormPage(Page, { data, form: null });

		expect(getRenderedInput(document, '#username').value).toBe('rui@exemplo.dev');
		expect(getRenderedInput(document, '#name').value).toBe('Rui Souza');
		expect(getRenderedSelect(document, '#roles').value).toBe('comunicacao:admin');
	});

	it('does not show the password strength meter', () => {
		const document = renderUserFormPage(Page, { data, form: null });

		expect(document.querySelector('progress')).toBeNull();
	});
});

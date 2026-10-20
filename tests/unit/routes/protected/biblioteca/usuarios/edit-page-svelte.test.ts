import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/usuarios/[id=alphanumeric]/+page.svelte';
import { describeUserFormPage, renderUserFormPage } from '../../../../support/user-form-page-suite';
import { getRenderedInput, getRenderedSelect } from '../../../../support/rendered-document';

const data = { usuario: { username: 'ana@exemplo.dev', name: 'Ana Souza', roles: 'biblioteca:admin' } };

describe('biblioteca user edit page', () => {
	describeUserFormPage({
		page: Page,
		data,
		fields: ['username', 'password', 'name', 'roles'],
		successStatus: 200,
		successMessage: 'Usuário atualizado com sucesso!',
	});

	it('fills the form with the current user', () => {
		const document = renderUserFormPage(Page, { data, form: null });

		expect(getRenderedInput(document, '#username').value).toBe('ana@exemplo.dev');
		expect(getRenderedInput(document, '#name').value).toBe('Ana Souza');
		expect(getRenderedSelect(document, '#roles').value).toBe('biblioteca:admin');
	});
});

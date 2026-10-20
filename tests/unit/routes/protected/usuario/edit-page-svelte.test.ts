import { describe, expect, it } from 'vitest';

import Page from '../../../../../src/routes/(protected)/usuario/[id=alphanumeric]/+page.svelte';
import { describeUserFormPage, renderUserFormPage } from '../../../support/user-form-page-suite';
import { getRenderedInput } from '../../../support/rendered-document';

const data = { usuario: { name: 'Ana Souza' } };

describe('own user page', () => {
	describeUserFormPage({
		page: Page,
		data,
		fields: ['name', 'password'],
		successStatus: 200,
		successMessage: 'Usuário atualizado com sucesso!',
	});

	it('fills the name with the signed-in user', () => {
		const document = renderUserFormPage(Page, { data, form: null });

		expect(getRenderedInput(document, '#name').value).toBe('Ana Souza');
		expect(getRenderedInput(document, '#password').value).toBe('');
	});
});

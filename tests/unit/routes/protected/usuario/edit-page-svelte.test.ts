import { describe, expect, it } from 'vitest';

import Page from '../../../../../src/routes/(protected)/usuario/[id=alphanumeric]/+page.svelte';
import { describeUserFormPage, renderUserFormPage } from '../../../support/user-form-page-suite';
import { getRenderedInput } from '../../../support/rendered-document';

const data = { usuario: { id: 'ana-1', name: 'Ana Souza' } };

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

	it('links back to the module selection through the breadcrumb', () => {
		const document = renderUserFormPage(Page, { data, form: null });

		const trail = [...document.querySelectorAll('nav[aria-label="Trilha de navegação"] a')].map((link) => [
			link.textContent?.trim(),
			link.getAttribute('href'),
		]);

		expect(trail).toEqual([
			['Módulos', '/sistemas'],
			['Meu cadastro', '/usuario/ana-1'],
		]);
	});
});

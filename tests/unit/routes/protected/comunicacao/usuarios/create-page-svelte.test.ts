import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/comunicacao/usuarios/novo/+page.svelte';
import { describeUserFormPage, renderUserFormPage } from '../../../../support/user-form-page-suite';

describe('new comunicacao user page', () => {
	describeUserFormPage({
		page: Page,
		fields: ['username', 'password', 'name', 'roles'],
		successStatus: 201,
		successMessage: 'Usuário cadastrado com sucesso!',
	});

	it('offers the volunteer and coordination levels', () => {
		const document = renderUserFormPage(Page, { form: null });

		const levels = [...document.querySelectorAll('#roles option')].map((option) => option.getAttribute('value'));

		expect(levels).toEqual(['comunicacao', 'comunicacao:admin']);
	});
});

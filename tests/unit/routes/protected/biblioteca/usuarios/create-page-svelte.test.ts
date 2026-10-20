import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/usuarios/novo/+page.svelte';
import { describeUserFormPage, renderUserFormPage } from '../../../../support/user-form-page-suite';

describe('new biblioteca user page', () => {
	describeUserFormPage({
		page: Page,
		fields: ['username', 'password', 'name', 'roles'],
		successStatus: 201,
		successMessage: 'Usuário cadastrado com sucesso!',
	});

	it('offers the biblioteca sectors', () => {
		const document = renderUserFormPage(Page, { form: null });

		const sectors = [...document.querySelectorAll('#roles option')].map((option) => option.getAttribute('value'));

		expect(sectors).toEqual(['biblioteca', 'biblioteca:admin']);
	});

	it('shows the password strength meter', () => {
		const document = renderUserFormPage(Page, { form: null });

		expect(document.querySelector('progress')?.getAttribute('max')).toBe('50');
	});
});

import { describe, expect, it } from 'vitest';

import Page from '../../../../../src/routes/(protected)/usuarios/+page.svelte';
import { renderUserFormPage } from '../../../support/user-form-page-suite';

const usuarios = [
	{
		id: 'k3m9q2x7',
		name: 'Álvaro Lima',
		username: 'alvaro@exemplo.dev',
		accessSummary: 'Biblioteca: Coordenação, Superusuário',
	},
	{ id: 'p2r8s4t6', name: 'Bruna Reis', username: 'bruna@exemplo.dev', accessSummary: 'Sem acesso' },
];

const readItems = (data: { usuarios: typeof usuarios }) =>
	[...renderUserFormPage(Page, { data, form: null }).querySelectorAll('main ul li')].map((item) => [
		item.querySelector('a')?.textContent?.trim(),
		item.querySelector('a')?.getAttribute('href'),
		...[...item.querySelectorAll('p')].map((line) => line.textContent?.trim()),
	]);

describe('TU-26 user list page', () => {
	it('lists each user as a link with the login and the access summary in the received order', () => {
		const items = readItems({ usuarios });

		expect(items).toEqual([
			['Álvaro Lima', '/usuarios/k3m9q2x7', 'alvaro@exemplo.dev', 'Biblioteca: Coordenação, Superusuário'],
			['Bruna Reis', '/usuarios/p2r8s4t6', 'bruna@exemplo.dev', 'Sem acesso'],
		]);
	});

	it('says that no user was found when the list is empty', () => {
		const document = renderUserFormPage(Page, { data: { usuarios: [] }, form: null });

		expect(document.querySelector('main ul')).toBeNull();
		expect(document.querySelector('main')?.textContent).toContain('Nenhum usuário encontrado.');
	});

	it('offers the creation of a new user', () => {
		const document = renderUserFormPage(Page, { data: { usuarios }, form: null });

		const link = [...document.querySelectorAll('main a')].find(
			(anchor) => anchor.textContent?.trim() === 'Novo usuário',
		);

		expect(link?.getAttribute('href')).toBe('/usuarios/novo');
	});
});

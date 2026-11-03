import type { Component } from 'svelte';
import { describe, expect, it } from 'vitest';

import EditPage from '../../../../../src/routes/(protected)/usuarios/[id=alphanumeric]/+page.svelte';
import NewPage from '../../../../../src/routes/(protected)/usuarios/novo/+page.svelte';
import { renderUserFormPage } from '../../../support/user-form-page-suite';

const usuario = {
	id: 'ana-1',
	username: 'ana@exemplo.dev',
	name: 'Ana Souza',
	access: {
		modules: { biblioteca: 'none', secretaria: 'volunteer', tesouraria: 'none', comunicacao: 'none' },
		superuser: false,
	},
};

const readPage = (page: Component<never>, data?: unknown) => {
	const document = renderUserFormPage(page, { data, form: null });
	const trail = [...document.querySelectorAll('nav[aria-label="Trilha de navegação"] a')].map((link) => [
		link.textContent?.trim(),
		link.getAttribute('href'),
	]);

	return { title: document.querySelector('h1')?.textContent?.trim(), trail, document };
};

describe('user account form pages', () => {
	it('places the creation under the user list', () => {
		const { title, trail } = readPage(NewPage);

		expect(title).toBe('Novo usuário');
		expect(trail).toEqual([
			['Módulos', '/sistemas'],
			['Usuários', '/usuarios'],
			['Novo usuário', '/usuarios/novo'],
		]);
	});

	it('names the edited user in the trail', () => {
		const { title, trail } = readPage(EditPage, { usuario });

		expect(title).toBe('Editar usuário');
		expect(trail).toEqual([
			['Módulos', '/sistemas'],
			['Usuários', '/usuarios'],
			['Ana Souza', '/usuarios/ana-1'],
		]);
	});

	it('fills the edition form with the loaded user', () => {
		const { document } = readPage(EditPage, { usuario });

		expect(document.querySelector('#username')?.getAttribute('value')).toBe('ana@exemplo.dev');
		expect(document.querySelector('#access-secretaria-volunteer')?.hasAttribute('checked')).toBe(true);
	});
});

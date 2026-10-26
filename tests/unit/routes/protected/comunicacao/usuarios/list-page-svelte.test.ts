// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/comunicacao/usuarios/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

type ListedUser = { id: string; name: string };

const renderUsers = (usuarios: Promise<ListedUser[]>) => renderComponent(Page, { data: { usuarios } });

describe('comunicacao user list page', () => {
	it('searches users by name through a GET form', async () => {
		const target = await renderUsers(Promise.resolve([]));

		const form = target.querySelector('form');

		expect([form?.getAttribute('method'), form?.getAttribute('action')]).toEqual(['GET', '/comunicacao/usuarios']);
		expect(target.querySelector('label[for="nome"]')?.textContent).toBe('Nome do usuário');
		expect(target.querySelector('a[href="/comunicacao/usuarios/novo"]')?.textContent?.trim()).toBe('Novo');
	});

	it('lists each loaded user with a link to edit it', async () => {
		const target = await renderUsers(Promise.resolve([{ id: 'abc123', name: 'Rui Voluntário' }]));

		await vi.waitFor(() => expect(target.querySelector('tbody td')?.textContent).toBe('Rui Voluntário'));

		const edit = target.querySelector('tbody a[aria-label="Editar usuário Rui Voluntário"]');
		expect(edit?.getAttribute('href')).toBe('/comunicacao/usuarios/abc123');
	});

	it('tells that no user matches the search', async () => {
		const target = await renderUsers(Promise.resolve([]));

		await vi.waitFor(() =>
			expect(target.querySelector('tbody td')?.textContent?.trim()).toBe('Nenhum usuário encontrado.'),
		);
	});
});

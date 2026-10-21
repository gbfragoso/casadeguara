// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/usuarios/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

type ListedUser = { id: string; name: string };

const renderUsers = (usuarios: Promise<ListedUser[]>) => renderComponent(Page, { data: { usuarios } });

describe('biblioteca user list page', () => {
	it('searches users by name through a GET form', async () => {
		const target = await renderUsers(Promise.resolve([]));

		const form = target.querySelector('form');

		expect([form?.getAttribute('method'), form?.getAttribute('action')]).toEqual(['GET', '/biblioteca/usuarios']);
		expect(target.querySelector('label[for="nome"]')?.textContent).toBe('Nome do usuário');
		expect(target.querySelector('a[href="/biblioteca/usuarios/novo"]')?.textContent?.trim()).toBe('Novo');
	});

	it('shows a loading placeholder while the users are pending', async () => {
		const target = await renderUsers(new Promise(() => undefined));

		const cells = target.querySelectorAll('tbody tr td');

		expect(cells).toHaveLength(2);
		expect([...cells].every((cell) => cell.querySelector('[aria-hidden="true"]'))).toBe(true);
	});

	it('lists each user with a link to edit it', async () => {
		const target = await renderUsers(Promise.resolve([{ id: 'abc123', name: 'Helena Bibliotecária' }]));

		await vi.waitFor(() => expect(target.querySelector('tbody td')?.textContent).toBe('Helena Bibliotecária'));

		const edit = target.querySelector('tbody a[aria-label="editar"]');
		expect(edit?.getAttribute('href')).toBe('/biblioteca/usuarios/abc123');
	});

	it('shows no rows when no user matches the search', async () => {
		const target = await renderUsers(Promise.resolve([]));

		await vi.waitFor(() => expect(target.querySelectorAll('tbody tr')).toHaveLength(0));
	});
});

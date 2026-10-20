import { describe, expect, it } from 'vitest';

import type { ResolvedPathname } from '$app/types';
import { isMenuItemActive, visibleMenuItems, type ModuleMenuItem } from '#lib/components/navigation/module-menu.js';

type MenuMatch = Pick<ModuleMenuItem, 'href' | 'match'>;

const menuItem = (href: ResolvedPathname, adminOnly?: boolean): ModuleMenuItem => ({
	href,
	label: href,
	title: href,
	ariaLabel: href,
	icon: 'fa-solid fa-house',
	match: 'prefix',
	adminOnly,
});

describe('isMenuItemActive', () => {
	it('matches an exact item only on the same path', () => {
		const home: MenuMatch = { href: '/biblioteca', match: 'exact' };

		const matches = ['/biblioteca', '/biblioteca/livros'].map((pathname) => isMenuItemActive(pathname, home));

		expect(matches).toEqual([true, false]);
	});

	it('matches a prefix item on its own path and on its subpaths', () => {
		const books: MenuMatch = { href: '/biblioteca/livros', match: 'prefix' };

		const matches = [
			'/biblioteca/livros',
			'/biblioteca/livros/12/autores',
			'/biblioteca/livrosx',
			'/biblioteca',
		].map((pathname) => isMenuItemActive(pathname, books));

		expect(matches).toEqual([true, true, false, false]);
	});
});

describe('visibleMenuItems', () => {
	const items = [
		menuItem('/tesouraria/lancamentos'),
		menuItem('/tesouraria/estornos', true),
		menuItem('/tesouraria/caixa', true),
	];

	it('removes the admin-only items for a non-admin user', () => {
		const visible = visibleMenuItems(items, false);

		expect(visible.map((item) => item.href)).toEqual(['/tesouraria/lancamentos']);
	});

	it('keeps every item for an admin user', () => {
		const visible = visibleMenuItems(items, true);

		expect(visible).toEqual(items);
	});
});

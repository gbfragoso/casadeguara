// @vitest-environment happy-dom
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/secretaria') }));
vi.mock('$app/state', () => ({ page: pageState }));

import Layout from '../../../../../src/routes/(protected)/secretaria/+layout.svelte';
import {
	getMenuButton,
	mountModuleLayout,
	readCurrentSidebarLinks,
	readSidebarLinks,
	unmountModuleLayouts,
} from '../../../support/module-layout';

const ADMIN = { username: 'Ana Admin', userid: 'admin-1', isAdmin: true };
const READER = { username: 'Rui Leitor', userid: 'reader-1', isAdmin: false };

const ACTIVE_ITEMS = [
	{ label: 'Início', pathname: '/secretaria' },
	{ label: 'Frequência', pathname: '/secretaria/frequencia/registro' },
	{ label: 'Aniversariantes', pathname: '/secretaria/aniversariantes' },
	{ label: 'Cadastros', pathname: '/secretaria/cadastros/1' },
	{ label: 'Amigo Fraterno', pathname: '/secretaria/amigofraterno' },
	{ label: 'Usuários', pathname: '/secretaria/usuarios/novo' },
];

const READER_LINKS = [
	{ label: 'Início', title: 'Página Inicial', ariaLabel: 'home' },
	{ label: 'Frequência', title: 'Frequência', ariaLabel: 'frequência' },
	{ label: 'Aniversariantes', title: 'Aniversariantes', ariaLabel: 'aniversariantes' },
	{ label: 'Cadastros', title: 'Cadastros', ariaLabel: 'cadastros' },
	{ label: 'Amigo Fraterno', title: 'Amigo Fraterno', ariaLabel: 'amigo fraterno' },
];

const ADMIN_LINKS = [...READER_LINKS, { label: 'Usuários', title: 'Usuários', ariaLabel: 'usuários' }];

describe('secretaria layout', () => {
	afterEach(unmountModuleLayouts);

	it.each(ACTIVE_ITEMS)('marks only $label as the current page at $pathname', async ({ label, pathname }) => {
		pageState.url = new URL(`http://localhost${pathname}`);

		const target = await mountModuleLayout(Layout, ADMIN);

		expect(readCurrentSidebarLinks(target)).toEqual([label]);
	});

	it('shows the administrative items to administrators', async () => {
		pageState.url = new URL('http://localhost/secretaria');

		const target = await mountModuleLayout(Layout, ADMIN);

		expect(readSidebarLinks(target)).toEqual(ADMIN_LINKS);
	});

	it('hides the administrative items from regular users', async () => {
		pageState.url = new URL('http://localhost/secretaria');

		const target = await mountModuleLayout(Layout, READER);

		expect(readSidebarLinks(target)).toEqual(READER_LINKS);
	});

	it('expands the sidebar from the menu button', async () => {
		pageState.url = new URL('http://localhost/secretaria');
		const target = await mountModuleLayout(Layout, READER);

		getMenuButton(target).click();
		await tick();

		expect(getMenuButton(target).getAttribute('aria-expanded')).toBe('true');
	});
});

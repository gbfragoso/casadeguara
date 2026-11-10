// @vitest-environment happy-dom
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/secretaria') }));
vi.mock('$app/state', () => ({ page: pageState }));

import Layout from '../../../../../src/routes/(protected)/secretaria/+layout.svelte';
import {
	getMenuButton,
	mountModuleLayout,
	PAGE_CONTENT,
	readCurrentSidebarLinks,
	readPageContent,
	readSidebarLinks,
	readUserMenuLinks,
	unmountModuleLayouts,
} from '../../../support/module-layout';
import { usePhoneViewport } from '../../../support/viewport';

const ADMIN = { username: 'Ana Admin', userid: 'admin-1', isAdmin: true, canManageUsers: false };
const READER = { username: 'Rui Leitor', userid: 'reader-1', isAdmin: false, canManageUsers: false };

const ACTIVE_ITEMS = [
	{ label: 'Início', pathname: '/secretaria' },
	{ label: 'Frequência', pathname: '/secretaria/frequencia' },
	{ label: 'Aniversariantes', pathname: '/secretaria/aniversariantes' },
	{ label: 'Cadastros', pathname: '/secretaria/cadastros/1' },
	{ label: 'Amigo Fraterno', pathname: '/secretaria/amigofraterno' },
];

const READER_LINKS = ['Início', 'Frequência', 'Aniversariantes', 'Cadastros', 'Amigo Fraterno'];

describe('secretaria layout', () => {
	afterEach(unmountModuleLayouts);

	it.each(ACTIVE_ITEMS)('marks only $label as the current page at $pathname', async ({ label, pathname }) => {
		pageState.url = new URL(`http://localhost${pathname}`);

		const target = await mountModuleLayout(Layout, ADMIN);

		expect(readCurrentSidebarLinks(target)).toEqual([label]);
	});

	it('TU-23 shows administrators the same items as regular users, without Usuários', async () => {
		pageState.url = new URL('http://localhost/secretaria');

		const target = await mountModuleLayout(Layout, ADMIN);

		expect(readSidebarLinks(target)).toEqual(READER_LINKS);
	});

	it('shows the module items to regular users', async () => {
		pageState.url = new URL('http://localhost/secretaria');

		const target = await mountModuleLayout(Layout, READER);

		expect(readSidebarLinks(target)).toEqual(READER_LINKS);
	});

	it('expands the sidebar from the menu button', async () => {
		usePhoneViewport();
		pageState.url = new URL('http://localhost/secretaria');
		const target = await mountModuleLayout(Layout, READER);

		getMenuButton(target).click();
		await tick();

		expect(getMenuButton(target).getAttribute('aria-expanded')).toBe('true');
	});

	it('renders the page content beside the sidebar and the top bar', async () => {
		pageState.url = new URL('http://localhost/secretaria');

		const target = await mountModuleLayout(Layout, READER);

		expect(readPageContent(target)).toBe(PAGE_CONTENT);
	});

	it('TU-22 offers the user management in the user menu to a superuser', async () => {
		const target = await mountModuleLayout(Layout, { ...READER, canManageUsers: true });

		expect(readUserMenuLinks(target)).toContain('Usuários');
	});
});

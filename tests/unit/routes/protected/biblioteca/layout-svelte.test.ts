// @vitest-environment happy-dom
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/biblioteca') }));
vi.mock('$app/state', () => ({ page: pageState }));

import Layout from '../../../../../src/routes/(protected)/biblioteca/+layout.svelte';
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
	{ label: 'Início', pathname: '/biblioteca' },
	{ label: 'Autores', pathname: '/biblioteca/autores/novo' },
	{ label: 'Avisos', pathname: '/biblioteca/avisos' },
	{ label: 'Cobranças', pathname: '/biblioteca/cobrancas' },
	{ label: 'Coleções', pathname: '/biblioteca/colecoes/1' },
	{ label: 'Editoras', pathname: '/biblioteca/editoras/novo' },
	{ label: 'Empréstimos', pathname: '/biblioteca/emprestimos/1/recibo' },
	{ label: 'Leitores', pathname: '/biblioteca/leitores/novo' },
	{ label: 'Livros', pathname: '/biblioteca/livros/1/exemplares' },
	{ label: 'Palavras-chave', pathname: '/biblioteca/keywords/novo' },
];

const READER_LINKS = [
	'Início',
	'Autores',
	'Avisos',
	'Coleções',
	'Editoras',
	'Empréstimos',
	'Leitores',
	'Livros',
	'Palavras-chave',
];

const ADMIN_LINKS = [...READER_LINKS.slice(0, 3), 'Cobranças', ...READER_LINKS.slice(3)];

describe('biblioteca layout', () => {
	afterEach(unmountModuleLayouts);

	it.each(ACTIVE_ITEMS)('marks only $label as the current page at $pathname', async ({ label, pathname }) => {
		pageState.url = new URL(`http://localhost${pathname}`);

		const target = await mountModuleLayout(Layout, ADMIN);

		expect(readCurrentSidebarLinks(target)).toEqual([label]);
	});

	it('TU-23 shows the administrative items, without Usuários, to administrators', async () => {
		pageState.url = new URL('http://localhost/biblioteca');

		const target = await mountModuleLayout(Layout, ADMIN);

		expect(readSidebarLinks(target)).toEqual(ADMIN_LINKS);
	});

	it('hides the administrative items from regular users', async () => {
		pageState.url = new URL('http://localhost/biblioteca');

		const target = await mountModuleLayout(Layout, READER);

		expect(readSidebarLinks(target)).toEqual(READER_LINKS);
	});

	it('expands the sidebar from the menu button', async () => {
		usePhoneViewport();
		pageState.url = new URL('http://localhost/biblioteca');
		const target = await mountModuleLayout(Layout, READER);

		getMenuButton(target).click();
		await tick();

		expect(getMenuButton(target).getAttribute('aria-expanded')).toBe('true');
	});

	it('renders the page content beside the sidebar and the top bar', async () => {
		pageState.url = new URL('http://localhost/biblioteca');

		const target = await mountModuleLayout(Layout, READER);

		expect(readPageContent(target)).toBe(PAGE_CONTENT);
	});

	it('TU-22 offers the user management in the user menu to a superuser', async () => {
		const target = await mountModuleLayout(Layout, { ...READER, canManageUsers: true });

		expect(readUserMenuLinks(target)).toContain('Usuários');
	});
});

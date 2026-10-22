// @vitest-environment happy-dom
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/tesouraria') }));
vi.mock('$app/state', () => ({ page: pageState }));

import Layout from '../../../../../src/routes/(protected)/tesouraria/+layout.svelte';
import {
	getMenuButton,
	mountModuleLayout,
	PAGE_CONTENT,
	readCurrentSidebarLinks,
	readPageContent,
	readSidebarLinks,
	unmountModuleLayouts,
} from '../../../support/module-layout';

const ADMIN = { username: 'Ana Admin', userid: 'admin-1', isAdmin: true };
const READER = { username: 'Rui Leitor', userid: 'reader-1', isAdmin: false };

const ACTIVE_ITEMS = [
	{ label: 'Início', pathname: '/tesouraria' },
	{ label: 'Lançamentos', pathname: '/tesouraria/lancamentos/1/estorno' },
	{ label: 'Estornos', pathname: '/tesouraria/estornos' },
	{ label: 'Caixa', pathname: '/tesouraria/caixa' },
	{ label: 'Contribuintes', pathname: '/tesouraria/contribuintes/1' },
];

const READER_LINKS = [
	{ label: 'Início', title: 'Página Inicial', ariaLabel: 'home' },
	{ label: 'Lançamentos', title: 'Lançamentos', ariaLabel: 'lançamentos' },
	{ label: 'Contribuintes', title: 'Contribuintes', ariaLabel: 'contribuintes' },
];

const ADMIN_LINKS = [
	...READER_LINKS.slice(0, 2),
	{ label: 'Estornos', title: 'Estornos', ariaLabel: 'estornos' },
	{ label: 'Caixa', title: 'Caixa', ariaLabel: 'caixa' },
	...READER_LINKS.slice(2),
];

describe('tesouraria layout', () => {
	afterEach(unmountModuleLayouts);

	it.each(ACTIVE_ITEMS)('marks only $label as the current page at $pathname', async ({ label, pathname }) => {
		pageState.url = new URL(`http://localhost${pathname}`);

		const target = await mountModuleLayout(Layout, ADMIN);

		expect(readCurrentSidebarLinks(target)).toEqual([label]);
	});

	it('shows the administrative items to administrators', async () => {
		pageState.url = new URL('http://localhost/tesouraria');

		const target = await mountModuleLayout(Layout, ADMIN);

		expect(readSidebarLinks(target)).toEqual(ADMIN_LINKS);
	});

	it('hides the administrative items from regular users', async () => {
		pageState.url = new URL('http://localhost/tesouraria');

		const target = await mountModuleLayout(Layout, READER);

		expect(readSidebarLinks(target)).toEqual(READER_LINKS);
	});

	it('expands the sidebar from the menu button', async () => {
		pageState.url = new URL('http://localhost/tesouraria');
		const target = await mountModuleLayout(Layout, READER);

		getMenuButton(target).click();
		await tick();

		expect(getMenuButton(target).getAttribute('aria-expanded')).toBe('true');
	});

	it('renders the page content beside the sidebar and the top bar', async () => {
		pageState.url = new URL('http://localhost/tesouraria');

		const target = await mountModuleLayout(Layout, READER);

		expect(readPageContent(target)).toBe(PAGE_CONTENT);
	});
});

import { readdirSync } from 'node:fs';

import { expect, test } from '@playwright/test';

import { ROUTE_CATALOG } from './support/route-catalog';

const ROUTES_ROOT = 'src/routes';
const PAGE_FILE = '+page.svelte';

const listPageRoutes = () =>
	readdirSync(ROUTES_ROOT, { recursive: true, encoding: 'utf8' })
		.map((file) => file.replaceAll('\\', '/'))
		.filter((file) => file === PAGE_FILE || file.endsWith(`/${PAGE_FILE}`))
		.map((file) => `/${file.slice(0, -PAGE_FILE.length)}`.replace(/(.)\/$/, '$1'))
		.sort();

test.describe('catálogo de rotas', () => {
	test('declara uma entrada para cada página do aplicativo', () => {
		const pages = listPageRoutes();

		const catalogued = ROUTE_CATALOG.map((entry) => entry.route).sort();

		expect(catalogued).toEqual(pages);
	});

	test('identifica cada entrada por um id único', () => {
		const ids = ROUTE_CATALOG.map((entry) => entry.id);

		expect(new Set(ids).size).toBe(ids.length);
	});
});

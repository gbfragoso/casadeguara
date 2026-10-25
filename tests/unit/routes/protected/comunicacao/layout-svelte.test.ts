// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/comunicacao/palestras') }));
vi.mock('$app/state', () => ({ page: pageState }));

import Layout from '../../../../../src/routes/(protected)/comunicacao/+layout.svelte';
import {
	mountModuleLayout,
	PAGE_CONTENT,
	readCurrentSidebarLinks,
	readPageContent,
	readSidebarLinks,
	unmountModuleLayouts,
} from '../../../support/module-layout';

const COORDINATOR = { username: 'Ana Coordenadora', userid: 'admin-1', isAdmin: true };
const VOLUNTEER = { username: 'Rui Voluntário', userid: 'volunteer-1', isAdmin: false };

const VOLUNTEER_LINKS = [
	{ label: 'Palestras', title: 'Palestras', ariaLabel: 'palestras' },
	{ label: 'Palestrantes', title: 'Palestrantes', ariaLabel: 'palestrantes' },
];

describe('TU-05 comunicacao layout', () => {
	afterEach(unmountModuleLayouts);

	it('shows only Palestras and Palestrantes to a volunteer', async () => {
		const target = await mountModuleLayout(Layout, VOLUNTEER);

		expect(readSidebarLinks(target)).toEqual(VOLUNTEER_LINKS);
	});

	it('adds Usuários for the coordination', async () => {
		const target = await mountModuleLayout(Layout, COORDINATOR);

		expect(readSidebarLinks(target)).toEqual([
			...VOLUNTEER_LINKS,
			{ label: 'Usuários', title: 'Usuários', ariaLabel: 'usuários' },
		]);
	});

	it('marks the section of a nested page as current', async () => {
		pageState.url = new URL('http://localhost/comunicacao/usuarios/abc123');

		const target = await mountModuleLayout(Layout, COORDINATOR);

		expect(readCurrentSidebarLinks(target)).toEqual(['Usuários']);
	});

	it('renders the page content inside the module shell', async () => {
		const target = await mountModuleLayout(Layout, VOLUNTEER);

		expect(readPageContent(target)).toBe(PAGE_CONTENT);
	});
});

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
	readUserMenuLinks,
	unmountModuleLayouts,
} from '../../../support/module-layout';

const COORDINATOR = { username: 'Ana Coordenadora', userid: 'admin-1', isAdmin: true, canManageUsers: false };
const VOLUNTEER = { username: 'Rui Voluntário', userid: 'volunteer-1', isAdmin: false, canManageUsers: false };

const VOLUNTEER_LINKS = ['Palestras', 'Palestrantes'];

describe('TU-05 comunicacao layout', () => {
	afterEach(unmountModuleLayouts);

	it('shows only Palestras and Palestrantes to a volunteer', async () => {
		const target = await mountModuleLayout(Layout, VOLUNTEER);

		expect(readSidebarLinks(target)).toEqual(VOLUNTEER_LINKS);
	});

	it('TU-23 shows the coordination the same items as a volunteer, without Usuários', async () => {
		const target = await mountModuleLayout(Layout, COORDINATOR);

		expect(readSidebarLinks(target)).toEqual(VOLUNTEER_LINKS);
	});

	it('marks the section of a nested page as current', async () => {
		pageState.url = new URL('http://localhost/comunicacao/palestrantes/abc123');

		const target = await mountModuleLayout(Layout, COORDINATOR);

		expect(readCurrentSidebarLinks(target)).toEqual(['Palestrantes']);
	});

	it('renders the page content inside the module shell', async () => {
		const target = await mountModuleLayout(Layout, VOLUNTEER);

		expect(readPageContent(target)).toBe(PAGE_CONTENT);
	});

	it('TU-22 offers the user management in the user menu to a superuser', async () => {
		const target = await mountModuleLayout(Layout, { ...VOLUNTEER, canManageUsers: true });

		expect(readUserMenuLinks(target)).toContain('Usuários');
	});
});

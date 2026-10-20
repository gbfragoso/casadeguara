import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../src/routes/(protected)/sistemas/+page.svelte';
import { hasModuleShell } from '../../../support/module-shell-regions';
import { parseRenderedBody } from '../../../support/rendered-document';

const renderModules = (roles: string[]) => parseRenderedBody(render(Page, { props: { data: { roles } } }).body);

const readModuleLinks = (roles: string[]) =>
	[...renderModules(roles).querySelectorAll('main a')].map((link) => [
		link.textContent?.trim(),
		link.getAttribute('href'),
	]);

describe('module selection page', () => {
	it('lists every module the user can access in the current order', () => {
		const links = readModuleLinks(['tesouraria', 'biblioteca', 'secretaria']);

		expect(links).toEqual([
			['biblioteca', '/biblioteca'],
			['secretaria', '/secretaria'],
			['tesouraria', '/tesouraria'],
		]);
	});

	it('treats an administrative role as access to its module', () => {
		const links = readModuleLinks(['tesouraria:admin']);

		expect(links).toEqual([['tesouraria', '/tesouraria']]);
	});

	it('renders the heading without the module shell', () => {
		const document = renderModules(['biblioteca']);

		expect(document.querySelector('main p')?.textContent).toBe('Selecione o módulo');
		expect(hasModuleShell(document)).toBe(false);
	});
});

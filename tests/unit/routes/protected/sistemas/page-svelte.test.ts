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
			['Biblioteca', '/biblioteca'],
			['Secretaria', '/secretaria'],
			['Tesouraria', '/tesouraria'],
		]);
	});

	it('treats an administrative role as access to its module', () => {
		const links = readModuleLinks(['tesouraria:admin']);

		expect(links).toEqual([['Tesouraria', '/tesouraria']]);
	});

	it('renders the heading without the module shell', () => {
		const document = renderModules(['biblioteca']);

		expect(document.querySelector('main h1')?.textContent).toBe('Selecione o módulo');
		expect(hasModuleShell(document)).toBe(false);
	});

	it('explains how to get access when the user has no module', () => {
		const document = renderModules([]);

		expect(document.querySelector('main a')).toBeNull();
		expect(document.querySelector('[role="status"]')?.textContent?.trim()).toBe(
			'Seu usuário ainda não tem acesso a nenhum módulo. Peça à coordenação do seu setor para liberar o acesso.',
		);
	});
});

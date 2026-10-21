// @vitest-environment happy-dom
import { flushSync, tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { afterNavigate, type AfterNavigate } from '$app/navigation';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/tesouraria') }));
vi.mock('$app/state', () => ({ page: pageState }));
vi.mock('$app/navigation', () => ({ afterNavigate: vi.fn() }));

import ModuleShell from '#lib/components/layout/ModuleShell.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

const renderShell = () =>
	renderComponent(ModuleShell, {
		items: [
			{
				href: '/tesouraria',
				label: 'Início',
				title: 'Página Inicial',
				ariaLabel: 'home',
				icon: 'fa-solid fa-house',
				match: 'exact',
			},
		],
		isAdmin: false,
		username: 'Ana Silva',
		userid: 'ana-1',
		children: htmlSnippet('<p>Conteúdo</p>'),
	});

describe('ModuleShell', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-theme');
		vi.mocked(afterNavigate).mockReset();
	});

	it('expands and collapses the sidebar from the top bar menu button', async () => {
		const target = await renderShell();
		const menuButton = getElement(
			target,
			'[data-testid="regiao-barra-superior"] [aria-label="menu"]',
			HTMLButtonElement,
		);

		menuButton.click();
		await tick();
		const expanded = menuButton.getAttribute('aria-expanded');
		menuButton.click();
		await tick();

		expect([expanded, menuButton.getAttribute('aria-expanded')]).toEqual(['true', 'false']);
	});

	it('collapses the expanded sidebar after a navigation', async () => {
		const target = await renderShell();
		const menuButton = getElement(target, '[aria-label="menu"]', HTMLButtonElement);
		const [onNavigate] = vi.mocked(afterNavigate).mock.calls[0];
		menuButton.click();
		await tick();

		onNavigate({} as AfterNavigate);
		flushSync();

		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('switches the theme from the top bar', async () => {
		const target = await renderShell();

		getElement(target, '[data-theme-toggle]', HTMLButtonElement).click();
		await tick();

		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
	});

	it('keeps the sidebar and the content section inside the main element', async () => {
		const target = await renderShell();

		const main = getElement(target, 'main', HTMLElement);

		expect(main.querySelector('nav[data-testid="regiao-menu-lateral"]')).not.toBeNull();
		expect(main.querySelector('section')?.textContent).toContain('Conteúdo');
	});
});

// @vitest-environment happy-dom
import { flushSync, tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { afterNavigate, type AfterNavigate } from '$app/navigation';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/tesouraria') }));
vi.mock('$app/state', () => ({ page: pageState }));
vi.mock('$app/navigation', () => ({ afterNavigate: vi.fn() }));

import ModuleShell from '#lib/components/layout/ModuleShell.svelte';
import { restoreDefaultViewport, usePhoneViewport } from '../../../support/viewport.js';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';
import ModulePageProbe from './support/ModulePageProbe.svelte';

const renderShell = () =>
	renderComponent(ModuleShell, {
		items: [{ href: '/tesouraria', label: 'Início', icon: 'fa-solid fa-house', match: 'exact' }],
		moduleName: 'Tesouraria',
		isAdmin: false,
		username: 'Ana Silva',
		userid: 'ana-1',
		canManageUsers: false,
		children: htmlSnippet('<p>Conteúdo</p>'),
	});

const getMenuButton = (target: HTMLElement) => getElement(target, '[aria-label="menu"]', HTMLButtonElement);

describe('ModuleShell', () => {
	beforeEach(usePhoneViewport);

	afterEach(() => {
		document.documentElement.removeAttribute('data-theme');
		vi.mocked(afterNavigate).mockReset();
		restoreDefaultViewport();
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
		const menuButton = getMenuButton(target);
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

	it('keeps the menu and the top bar outside the main content', async () => {
		const target = await renderShell();

		const main = getElement(target, 'main', HTMLElement);

		expect(
			main.querySelector('[data-testid="regiao-menu-lateral"], [data-testid="regiao-barra-superior"]'),
		).toBeNull();
		expect(main.textContent).toContain('Conteúdo');
	});

	it('offers a skip link to the main content before the menu', async () => {
		const target = await renderShell();

		const firstLink = getElement(target, 'a', HTMLAnchorElement);

		expect([firstLink.textContent.trim(), firstLink.getAttribute('href')]).toEqual([
			'Pular para o conteúdo',
			`#${getElement(target, 'main', HTMLElement).id}`,
		]);
	});

	it('moves focus into the menu when the drawer opens', async () => {
		const target = await renderShell();

		getMenuButton(target).click();
		await tick();

		expect(document.activeElement?.textContent?.trim()).toBe('Início');
	});

	it('makes the content inert only while the drawer is open', async () => {
		const target = await renderShell();
		const main = getElement(target, 'main', HTMLElement);
		const closed = main.inert;

		getMenuButton(target).click();
		await tick();

		expect([closed, main.inert]).toEqual([false, true]);
	});

	it('keeps the content usable on desktop, where the menu is always visible', async () => {
		restoreDefaultViewport();
		const target = await renderShell();

		getMenuButton(target).click();
		await tick();

		expect(getElement(target, 'main', HTMLElement).inert).toBe(false);
	});

	it('keeps the drawer closed after the viewport widens to desktop and narrows back', async () => {
		const target = await renderShell();
		getMenuButton(target).click();
		await tick();

		restoreDefaultViewport();
		await tick();
		usePhoneViewport();
		await tick();

		expect(getElement(target, 'main', HTMLElement).inert).toBe(false);
	});

	it('names the tab after the page title and the module', async () => {
		await renderComponent(ModulePageProbe, { moduleName: 'Tesouraria', title: 'Lançamentos' });

		expect(document.title).toBe('Lançamentos · Tesouraria · Casa de Guará');
	});
});

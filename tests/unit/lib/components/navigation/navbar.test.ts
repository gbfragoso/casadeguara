// @vitest-environment happy-dom
import type { Snippet } from 'svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Navbar from '#lib/components/navigation/Navbar.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

type NavbarOptions = {
	username?: string;
	sidebarExpanded?: boolean;
	onToggleSidebar?: () => void;
	search?: Snippet;
};

const renderNavbar = (options: NavbarOptions = {}) =>
	renderComponent(Navbar, {
		username: options.username ?? 'Ana Silva',
		userid: 'ana-1',
		sidebarExpanded: options.sidebarExpanded ?? false,
		onToggleSidebar: options.onToggleSidebar ?? vi.fn(),
		search: options.search,
	});

const getUserMenu = (target: HTMLElement) => getElement(target, '#dropdown-menu', HTMLElement);
const getUserMenuTrigger = (target: HTMLElement) =>
	getElement(target, '[aria-controls="dropdown-menu"]', HTMLButtonElement);

const pressEscape = async () => {
	window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
	await tick();
};

const openUserMenu = async (target: HTMLElement) => {
	getUserMenuTrigger(target).click();
	await tick();
};

const readUserMenuState = (target: HTMLElement) => ({
	expanded: getUserMenuTrigger(target).getAttribute('aria-expanded'),
	hidden: getUserMenu(target).hidden,
});

describe('Navbar', () => {
	afterEach(() => document.documentElement.removeAttribute('data-theme'));

	it('toggles the user menu from its trigger', async () => {
		const target = await renderNavbar();
		const initialState = readUserMenuState(target);

		getUserMenuTrigger(target).click();
		await tick();
		const openedState = readUserMenuState(target);
		getUserMenuTrigger(target).click();
		await tick();

		expect([initialState, openedState, readUserMenuState(target)]).toEqual([
			{ expanded: 'false', hidden: true },
			{ expanded: 'true', hidden: false },
			{ expanded: 'false', hidden: true },
		]);
		expect(getUserMenuTrigger(target).getAttribute('aria-controls')).toBe('dropdown-menu');
	});

	it('offers the greeting, the settings link and the logout form in the user menu', async () => {
		const target = await renderNavbar();

		const menu = getUserMenu(target);

		expect(menu.textContent).toContain('Bem-vindo(a), Ana');
		expect(menu.querySelector('a[href="/usuario/ana-1"]')?.textContent?.trim()).toBe('Meu cadastro');
		const logout = menu.querySelector('form[action="/logout"]');
		expect(logout?.getAttribute('method')).toBe('POST');
		expect(logout?.querySelector('button[type="submit"]')?.textContent).toContain('Sair');
	});

	it('lets the user go back to the module selection from the user menu', async () => {
		const target = await renderNavbar();

		const menu = getUserMenu(target);

		expect(menu.querySelector('a[href="/sistemas"]')?.textContent?.trim()).toBe('Trocar módulo');
	});

	it('toggles the color theme between dark and light', async () => {
		const target = await renderNavbar();
		const themeButton = getElement(target, '[data-theme-toggle]', HTMLButtonElement);

		themeButton.click();
		await tick();
		const firstTheme = document.documentElement.getAttribute('data-theme');
		themeButton.click();
		await tick();

		expect([firstTheme, document.documentElement.getAttribute('data-theme')]).toEqual(['dark', 'light']);
	});

	it('requests the sidebar toggle without changing the controlled state', async () => {
		const onToggleSidebar = vi.fn();
		const target = await renderNavbar({ onToggleSidebar });
		const menuButton = getElement(target, '[aria-label="menu"]', HTMLButtonElement);

		menuButton.click();
		await tick();

		expect(onToggleSidebar).toHaveBeenCalledOnce();
		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('reflects the controlled expanded sidebar state', async () => {
		const target = await renderNavbar({ sidebarExpanded: true });

		const menuButton = getElement(target, '[aria-label="menu"]', HTMLButtonElement);

		expect(menuButton.getAttribute('aria-expanded')).toBe('true');
	});

	it('reserves the search position without rendering a search field', async () => {
		const target = await renderNavbar();

		const topbar = getElement(target, '[data-testid="regiao-barra-superior"]', HTMLElement);

		expect(topbar.querySelector('input, [role="searchbox"], [role="textbox"]')).toBeNull();
	});

	it('renders the search snippet between the menu button and the theme toggle', async () => {
		const target = await renderNavbar({ search: htmlSnippet('<input type="search" aria-label="Buscar" />') });

		const search = getElement(target, 'input[type="search"]', HTMLInputElement);
		const menuButton = getElement(target, '[aria-label="menu"]', HTMLButtonElement);
		const themeButton = getElement(target, '[data-theme-toggle]', HTMLButtonElement);

		expect(menuButton.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(search.compareDocumentPosition(themeButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('greets a user registered with a single name', async () => {
		const target = await renderNavbar({ username: 'Joaquim' });

		const greeting = getUserMenu(target).querySelector('p')?.textContent;

		expect(greeting).toBe('Bem-vindo(a), Joaquim');
	});

	it('closes the user menu with Escape and returns focus to its trigger', async () => {
		const target = await renderNavbar();
		await openUserMenu(target);

		await pressEscape();

		expect(readUserMenuState(target)).toEqual({ expanded: 'false', hidden: true });
		expect(document.activeElement).toBe(getUserMenuTrigger(target));
	});

	it('closes the user menu when the pointer goes down outside it', async () => {
		const target = await renderNavbar();
		await openUserMenu(target);

		document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
		await tick();

		expect(readUserMenuState(target)).toEqual({ expanded: 'false', hidden: true });
	});

	it('keeps the user menu open when the pointer goes down inside it', async () => {
		const target = await renderNavbar();
		await openUserMenu(target);

		getUserMenu(target).dispatchEvent(new Event('pointerdown', { bubbles: true }));
		await tick();

		expect(readUserMenuState(target)).toEqual({ expanded: 'true', hidden: false });
	});

	it('requests the expanded sidebar to close with Escape', async () => {
		const onToggleSidebar = vi.fn();
		await renderNavbar({ sidebarExpanded: true, onToggleSidebar });

		await pressEscape();

		expect(onToggleSidebar).toHaveBeenCalledOnce();
	});

	it('switches to the light theme first when the page already uses the dark theme', async () => {
		document.documentElement.setAttribute('data-theme', 'dark');
		const target = await renderNavbar();
		const themeButton = getElement(target, '[data-theme-toggle]', HTMLButtonElement);
		const label = themeButton.getAttribute('aria-label');

		themeButton.click();
		await tick();

		expect([label, document.documentElement.getAttribute('data-theme')]).toEqual(['Ativar tema claro', 'light']);
	});

	it('shows a generic avatar and greeting when the user has no name', async () => {
		const target = await renderNavbar({ username: '  ' });

		const trigger = getUserMenuTrigger(target);

		expect([trigger.textContent?.trim(), trigger.querySelector('i[aria-hidden="true"]')?.tagName]).toEqual([
			'',
			'I',
		]);
		expect(getUserMenu(target).querySelector('p')?.textContent).toBe('Bem-vindo(a)');
	});

	it('closes the user menu when the focus leaves it', async () => {
		const target = await renderNavbar();
		await openUserMenu(target);

		getElement(target, '#dropdown', HTMLElement).dispatchEvent(
			new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }),
		);
		await tick();

		expect(readUserMenuState(target)).toEqual({ expanded: 'false', hidden: true });
	});
});

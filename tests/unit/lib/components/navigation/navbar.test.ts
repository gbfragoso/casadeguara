// @vitest-environment happy-dom
import type { Snippet } from 'svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Navbar from '#lib/components/navigation/Navbar.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

type NavbarOptions = { sidebarExpanded?: boolean; onToggleSidebar?: () => void; search?: Snippet };

const renderNavbar = (options: NavbarOptions = {}) =>
	renderComponent(Navbar, {
		username: 'Ana Silva',
		userid: 'ana-1',
		sidebarExpanded: options.sidebarExpanded ?? false,
		onToggleSidebar: options.onToggleSidebar ?? vi.fn(),
		search: options.search,
	});

const getUserMenu = (target: HTMLElement) => getElement(target, '#dropdown-menu', HTMLElement);
const getUserMenuTrigger = (target: HTMLElement) => getElement(target, '[aria-haspopup="true"]', HTMLButtonElement);

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

		expect(menu.textContent).toContain('Bem vindo(a), Ana');
		expect(menu.querySelector('a[href="/usuario/ana-1"]')?.textContent?.trim()).toBe('Configurações');
		const logout = menu.querySelector('form[action="/logout"]');
		expect(logout?.getAttribute('method')).toBe('POST');
		expect(logout?.querySelector('button[type="submit"]')?.textContent).toContain('Sair');
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
});

// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Navbar from '#lib/components/navigation/Navbar.svelte';

const getButton = (target: HTMLElement, selector: string) => {
	const button = target.querySelector(selector);
	if (!(button instanceof HTMLButtonElement)) throw new Error(`Button ${selector} was not rendered.`);
	return button;
};

describe('Navbar', () => {
	let mounted: ReturnType<typeof mount> | undefined;

	const mountNavbar = async (props: { sidebarExpanded?: boolean; onToggleSidebar?: () => void } = {}) => {
		const target = document.createElement('div');
		document.body.append(target);
		mounted = mount(Navbar, {
			target,
			props: {
				username: 'Ana Silva',
				userid: 'ana-1',
				sidebarExpanded: props.sidebarExpanded ?? false,
				onToggleSidebar: props.onToggleSidebar ?? vi.fn(),
			},
		});
		await tick();
		return target;
	};

	afterEach(() => {
		if (mounted) unmount(mounted);
		mounted = undefined;
		document.body.replaceChildren();
		document.documentElement.removeAttribute('data-theme');
	});

	it('toggles the expanded state of the user menu trigger', async () => {
		const target = await mountNavbar();
		const trigger = getButton(target, '[aria-haspopup="true"]');
		const initialState = trigger.getAttribute('aria-expanded');

		trigger.click();
		await tick();
		const openedState = trigger.getAttribute('aria-expanded');
		trigger.click();
		await tick();

		expect([initialState, openedState, trigger.getAttribute('aria-expanded')]).toEqual(['false', 'true', 'false']);
		expect(trigger.getAttribute('aria-controls')).toBe('dropdown-menu');
	});

	it('offers the greeting, the settings link and the logout form in the user menu', async () => {
		const target = await mountNavbar();

		const menu = target.querySelector('#dropdown-menu');

		expect(menu?.textContent).toContain('Bem vindo(a), Ana');
		expect(menu?.querySelector('a[href="/usuario/ana-1"]')?.textContent?.trim()).toBe('Configurações');
		const logout = menu?.querySelector('form[action="/logout"]');
		expect(logout?.getAttribute('method')).toBe('POST');
		expect(logout?.querySelector('button[type="submit"]')?.textContent).toContain('Sair');
	});

	it('toggles the color theme between dark and light', async () => {
		const target = await mountNavbar();
		const themeButton = getButton(target, '[data-theme-toggle]');

		themeButton.click();
		await tick();
		const firstTheme = document.documentElement.getAttribute('data-theme');
		themeButton.click();
		await tick();

		expect([firstTheme, document.documentElement.getAttribute('data-theme')]).toEqual(['dark', 'light']);
	});

	it('requests the sidebar toggle without changing the controlled state', async () => {
		const onToggleSidebar = vi.fn();
		const target = await mountNavbar({ onToggleSidebar });
		const menuButton = getButton(target, '[aria-label="menu"]');

		menuButton.click();
		await tick();

		expect(onToggleSidebar).toHaveBeenCalledOnce();
		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('reflects the controlled expanded sidebar state', async () => {
		const target = await mountNavbar({ sidebarExpanded: true });

		const menuButton = getButton(target, '[aria-label="menu"]');

		expect(menuButton.getAttribute('aria-expanded')).toBe('true');
	});
});

// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Navbar from '$lib/components/navigation/Navbar.svelte';

const getButton = (target: HTMLElement, selector: string) => {
	const button = target.querySelector(selector);
	if (!(button instanceof HTMLButtonElement)) throw new Error(`Button ${selector} was not rendered.`);
	return button;
};

describe('Navbar', () => {
	let mounted: ReturnType<typeof mount> | undefined;

	afterEach(() => {
		if (mounted) unmount(mounted);
		mounted = undefined;
		document.body.replaceChildren();
		document.documentElement.removeAttribute('data-theme');
	});

	it('toggles the sidebar, menu, and color theme', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const onToggleSidebar = vi.fn();
		mounted = mount(Navbar, {
			target,
			props: { username: 'Ana Silva', userid: 'ana-1', sidebarExpanded: false, onToggleSidebar },
		});
		await tick();

		const menuButton = getButton(target, '[aria-label="menu"]');
		const themeButton = getButton(target, '[data-theme-toggle]');
		const dropdownButton = getButton(target, '[aria-haspopup="true"]');
		const dropdown = target.querySelector('#dropdown');
		if (!(dropdown instanceof HTMLDivElement)) throw new Error('Dropdown was not rendered.');

		menuButton.click();
		themeButton.click();
		dropdownButton.click();
		await tick();

		expect(onToggleSidebar).toHaveBeenCalledOnce();
		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		expect(dropdown.classList.contains('is-active')).toBe(true);

		menuButton.click();
		themeButton.click();
		dropdownButton.click();
		await tick();

		expect(onToggleSidebar).toHaveBeenCalledTimes(2);
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(dropdown.classList.contains('is-active')).toBe(false);
	});

	it('reflects the controlled expanded sidebar state', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		mounted = mount(Navbar, {
			target,
			props: {
				username: 'Ana Silva',
				userid: 'ana-1',
				sidebarExpanded: true,
				onToggleSidebar: vi.fn(),
			},
		});
		await tick();
		const menuButton = getButton(target, '[aria-label="menu"]');

		expect(menuButton.getAttribute('aria-expanded')).toBe('true');
		expect(menuButton.classList.contains('is-active')).toBe(true);
	});
});

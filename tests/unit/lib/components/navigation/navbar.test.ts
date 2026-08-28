// @vitest-environment happy-dom
import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import Navbar from '$lib/components/navigation/Navbar.svelte';

const getButton = (target: HTMLElement, selector: string) => {
	const button = target.querySelector(selector);
	if (!(button instanceof HTMLButtonElement)) throw new Error(`Button ${selector} was not rendered.`);
	return button;
};

describe('Navbar', () => {
	it('toggles the sidebar, menu, and color theme', async () => {
		const sidebar = document.createElement('aside');
		sidebar.id = 'sidebar';
		sidebar.classList.add('is-hidden-touch');
		document.body.append(sidebar);
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(Navbar, { target, props: { username: 'Ana Silva', userid: 'ana-1' } });
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

		expect(sidebar.classList.contains('is-hidden-touch')).toBe(false);
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		expect(dropdown.classList.contains('is-active')).toBe(true);

		menuButton.click();
		themeButton.click();
		dropdownButton.click();
		await tick();

		expect(sidebar.classList.contains('is-hidden-touch')).toBe(true);
		expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		expect(dropdown.classList.contains('is-active')).toBe(false);
		unmount(component);
		target.remove();
		sidebar.remove();
	});

	it('keeps controls operable when their document targets are absent', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(Navbar, { target, props: { username: 'Ana Silva', userid: 'ana-1' } });
		await tick();
		const dropdownButton = getButton(target, '[aria-haspopup="true"]');
		target.querySelector('#dropdown')?.remove();

		getButton(target, '[aria-label="menu"]').click();
		dropdownButton.click();
		await tick();

		expect(target.querySelector('[aria-label="menu"]')).not.toBeNull();
		unmount(component);
		target.remove();
	});
});

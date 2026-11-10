// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import SiteHeader from '#lib/components/site/SiteHeader.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

const DEPARTMENTS_BUTTON = 'button[aria-controls="submenu-departamentos"]';
const MATERIALS_BUTTON = 'button[aria-controls="submenu-material-de-estudo"]';

const renderHeader = async (currentPath = '/') => {
	const target = await renderComponent(SiteHeader, { currentPath });
	return {
		target,
		menuButton: getElement(target, 'button[aria-controls="menu-do-site"]', HTMLButtonElement),
		departmentsButton: getElement(target, DEPARTMENTS_BUTTON, HTMLButtonElement),
		materialsButton: getElement(target, MATERIALS_BUTTON, HTMLButtonElement),
	};
};

const click = async (element: HTMLElement) => {
	element.click();
	await tick();
};

const pressEscape = async (element: HTMLElement) => {
	element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
	await tick();
};

describe('SiteHeader', () => {
	it('keeps the phone menu closed at first', async () => {
		const { menuButton } = await renderHeader();

		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('names the icon-only phone menu button for assistive technology', async () => {
		const { menuButton } = await renderHeader();

		expect(menuButton.getAttribute('aria-label')).toBe('Menu');
	});

	it('turns the menu button glyph into a close mark while the menu is open', async () => {
		const { menuButton } = await renderHeader();
		const closedIcon = menuButton.querySelector('svg')?.getAttribute('data-icon');

		await click(menuButton);

		expect([closedIcon, menuButton.querySelector('svg')?.getAttribute('data-icon')]).toEqual(['menu', 'close']);
	});

	it('opens the phone menu from the menu button', async () => {
		const { menuButton } = await renderHeader();

		await click(menuButton);

		expect(menuButton.getAttribute('aria-expanded')).toBe('true');
	});

	it('closes the phone menu once a page is chosen', async () => {
		const { target, menuButton } = await renderHeader();
		await click(menuButton);

		await click(getElement(target, 'a[href="/a-instituicao"]', HTMLAnchorElement));

		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('takes the visitor home from the seal', async () => {
		const { target } = await renderHeader('/diretoria');

		const seal = target.querySelector('a:has(img)');

		expect(seal?.getAttribute('href')).toBe('/');
	});

	it('opens a group and shows its pages', async () => {
		const { target, departmentsButton } = await renderHeader();

		await click(departmentsButton);

		expect(departmentsButton.getAttribute('aria-expanded')).toBe('true');
		expect(target.querySelector('#submenu-departamentos')?.hasAttribute('hidden')).toBe(false);
	});

	it('closes an open group from its button', async () => {
		const { target, departmentsButton } = await renderHeader();
		await click(departmentsButton);

		await click(departmentsButton);

		expect(target.querySelector('#submenu-departamentos')?.hasAttribute('hidden')).toBe(true);
	});

	it('closes the group on Escape and returns the focus to its button', async () => {
		const { target, departmentsButton } = await renderHeader();
		await click(departmentsButton);
		const firstPage = getElement(target, '#submenu-departamentos a', HTMLAnchorElement);
		firstPage.focus();

		await pressEscape(firstPage);

		expect(departmentsButton.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(departmentsButton);
	});

	it('keeps a single group open at a time', async () => {
		const { departmentsButton, materialsButton } = await renderHeader();
		await click(departmentsButton);

		await click(materialsButton);

		expect([departmentsButton, materialsButton].map((button) => button.getAttribute('aria-expanded'))).toEqual([
			'false',
			'true',
		]);
	});

	it('closes the group when the visitor clicks elsewhere', async () => {
		const { departmentsButton } = await renderHeader();
		await click(departmentsButton);

		await click(document.body);

		expect(departmentsButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes the group when the focus moves out of it', async () => {
		const { target, departmentsButton } = await renderHeader();
		await click(departmentsButton);
		departmentsButton.focus();

		getElement(target, 'a[href="/palestras"]', HTMLAnchorElement).focus();
		await tick();

		expect(departmentsButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('closes the group and the phone menu once a page in the group is chosen', async () => {
		const { target, menuButton, departmentsButton } = await renderHeader();
		await click(menuButton);
		await click(departmentsButton);

		await click(getElement(target, 'a[href="/departamentos/recanto"]', HTMLAnchorElement));

		expect([menuButton, departmentsButton].map((button) => button.getAttribute('aria-expanded'))).toEqual([
			'false',
			'false',
		]);
	});

	it('marks the link of the current page', async () => {
		const { target } = await renderHeader('/palestras');

		const current = [...target.querySelectorAll('[aria-current="page"]')].map((link) => link.textContent?.trim());

		expect(current).toEqual(['Palestras']);
	});

	it('tells which group holds the current page', async () => {
		const { departmentsButton, materialsButton } = await renderHeader('/departamentos/juventude');

		expect(departmentsButton.textContent).toContain('(seção atual)');
		expect(materialsButton.textContent).not.toContain('(seção atual)');
	});
});

// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import SiteHeader from '#lib/components/site/SiteHeader.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

const renderHeader = async () => {
	const target = await renderComponent(SiteHeader, {});
	return {
		menuButton: getElement(target, 'button', HTMLButtonElement),
		firstSectionLink: getElement(target, 'nav a[href="#palestras"]', HTMLAnchorElement),
	};
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

	it('opens the phone menu from the menu button', async () => {
		const { menuButton } = await renderHeader();

		menuButton.click();
		await tick();

		expect(menuButton.getAttribute('aria-expanded')).toBe('true');
	});

	it('closes the phone menu once a section is chosen', async () => {
		const { menuButton, firstSectionLink } = await renderHeader();
		menuButton.click();
		await tick();

		firstSectionLink.click();
		await tick();

		expect(menuButton.getAttribute('aria-expanded')).toBe('false');
	});
});

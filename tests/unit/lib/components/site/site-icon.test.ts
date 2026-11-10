// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import SiteIcon from '#lib/components/site/SiteIcon.svelte';
import { SITE_ICONS } from '#lib/site/site-icons.js';
import { renderComponent } from '../support/render-component.js';

const renderIcon = async (name: keyof typeof SITE_ICONS) => {
	const icon = (await renderComponent(SiteIcon, { name })).querySelector('svg');
	if (!icon) throw new Error('Ícone não renderizado.');
	return icon;
};

describe('SiteIcon', () => {
	it('hides the drawing from assistive technology', async () => {
		const icon = await renderIcon('menu');

		expect([icon.getAttribute('aria-hidden'), icon.getAttribute('focusable')]).toEqual(['true', 'false']);
	});

	it('strokes the line icons with the drawn stroke width', async () => {
		const icon = await renderIcon('chevronDown');

		expect([icon.getAttribute('viewBox'), icon.getAttribute('stroke-width')]).toEqual(['0 0 24 24', '2.4']);
	});

	it('draws a brand mark as a filled shape in its own proportions', async () => {
		const icon = await renderIcon('youtube');

		expect([icon.getAttribute('viewBox'), icon.hasAttribute('stroke-width')]).toEqual(['0 0 576 512', false]);
	});

	it('draws the path of the requested icon', async () => {
		const icon = await renderIcon('instagram');

		expect(icon.querySelector('path')?.getAttribute('d')).toBe(SITE_ICONS.instagram.path);
	});
});

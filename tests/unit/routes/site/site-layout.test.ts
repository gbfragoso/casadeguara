// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/diretoria') } }));

import SiteLayout from '../../../../src/routes/(site)/+layout.svelte';
import { htmlSnippet, renderComponent } from '../../lib/components/support/render-component.js';

describe('public site layout', () => {
	it('frames the page between the site header and footer', async () => {
		const target = await renderComponent(SiteLayout, { children: htmlSnippet('<p>Conteúdo da página</p>') });

		const regions = [...target.querySelectorAll('header, main, footer')].map((region) => region.tagName);

		expect(regions).toEqual(['HEADER', 'MAIN', 'FOOTER']);
		expect(target.querySelector('main')?.textContent?.trim()).toBe('Conteúdo da página');
	});

	it('marks the page being visited in the header menu', async () => {
		const target = await renderComponent(SiteLayout, { children: htmlSnippet('<p></p>') });

		const current = target.querySelector('header [aria-current="page"]');

		expect(current?.textContent?.trim()).toBe('Diretoria');
	});
});

// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import AccessCard from '#lib/components/layout/AccessCard.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

describe('AccessCard', () => {
	it('renders the access content inside the main landmark', async () => {
		const target = await renderComponent(AccessCard, {
			children: htmlSnippet('<p>Selecione o módulo</p>'),
		});

		expect(getElement(target, 'main', HTMLElement).textContent).toContain('Selecione o módulo');
	});
});

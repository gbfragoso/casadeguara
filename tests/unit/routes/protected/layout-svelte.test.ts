// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import Layout from '../../../../src/routes/(protected)/+layout.svelte';
import { htmlSnippet, renderComponent } from '../../lib/components/support/render-component.js';

describe('protected group layout', () => {
	it('renders the module page it wraps', async () => {
		const target = await renderComponent(Layout, { children: htmlSnippet('<p>Página do módulo</p>') });

		expect(target.textContent).toContain('Página do módulo');
	});
});

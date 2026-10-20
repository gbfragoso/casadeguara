import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Layout from '../../../../src/routes/acervo/+layout.svelte';
import { hasModuleShell } from '../../support/module-shell-regions';
import { parseRenderedBody } from '../../support/rendered-document';

const children = createRawSnippet(() => ({ render: () => '<p>Acervo</p>' }));

describe('acervo layout', () => {
	it('renders the public page content without the module shell', () => {
		const document = parseRenderedBody(render(Layout, { props: { children } }).body);

		expect(document.querySelector('main')?.textContent?.trim()).toBe('Acervo');
		expect(hasModuleShell(document)).toBe(false);
	});
});

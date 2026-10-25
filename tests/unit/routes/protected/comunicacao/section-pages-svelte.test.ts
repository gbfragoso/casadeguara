import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import SpeakersPage from '../../../../../src/routes/(protected)/comunicacao/palestrantes/+page.svelte';
import { parseRenderedBody } from '../../../support/rendered-document';

describe('comunicacao section pages', () => {
	it('opens the Palestrantes section under the module breadcrumb', () => {
		const document = parseRenderedBody(render(SpeakersPage).body);

		const header = {
			title: document.querySelector('h1')?.textContent?.trim(),
			breadcrumb: [...document.querySelectorAll('nav a')].map((link) => link.getAttribute('href')),
		};

		expect(header).toEqual({ title: 'Palestrantes', breadcrumb: ['/comunicacao', '/comunicacao/palestrantes'] });
	});
});

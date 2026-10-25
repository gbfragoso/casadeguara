import type { Component } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import SpeakersPage from '../../../../../src/routes/(protected)/comunicacao/palestrantes/+page.svelte';
import TalksPage from '../../../../../src/routes/(protected)/comunicacao/palestras/+page.svelte';
import { parseRenderedBody } from '../../../support/rendered-document';

const readHeader = (page: Component) => {
	const document = parseRenderedBody(render(page).body);

	return {
		title: document.querySelector('h1')?.textContent?.trim(),
		breadcrumb: [...document.querySelectorAll('nav a')].map((link) => link.getAttribute('href')),
	};
};

describe('comunicacao section pages', () => {
	it.each([
		['Palestras', TalksPage, '/comunicacao/palestras'],
		['Palestrantes', SpeakersPage, '/comunicacao/palestrantes'],
	])('opens the %s section under the module breadcrumb', (title, page, path) => {
		expect(readHeader(page)).toEqual({ title, breadcrumb: ['/comunicacao', path] });
	});
});

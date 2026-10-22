// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import PageHeader from '#lib/components/navigation/PageHeader.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

const BREADCRUMB = [
	{ label: 'Biblioteca', href: '/biblioteca' },
	{ label: 'Página Inicial', href: '/biblioteca' },
] as const;

describe('PageHeader', () => {
	it('renders the breadcrumb with the current page and the title heading', async () => {
		const target = await renderComponent(PageHeader, {
			breadcrumb: BREADCRUMB,
			children: htmlSnippet('<span>Balanço de outubro de 2026</span>'),
		});

		const current = getElement(
			target,
			'nav[aria-label="Trilha de navegação"] [aria-current="page"]',
			HTMLAnchorElement,
		);
		const heading = getElement(target, 'h1', HTMLHeadingElement);

		expect(current.textContent).toBe('Página Inicial');
		expect(heading.textContent.trim()).toBe('Balanço de outubro de 2026');
	});

	it('keeps the header printable by default', async () => {
		const target = await renderComponent(PageHeader, {
			breadcrumb: BREADCRUMB,
			children: htmlSnippet('<span>Livros</span>'),
		});

		expect(getElement(target, 'header', HTMLElement).dataset.print).toBeUndefined();
	});

	it('marks the whole header as hidden in print when the title is not printable', async () => {
		const target = await renderComponent(PageHeader, {
			breadcrumb: BREADCRUMB,
			printTitle: false,
			children: htmlSnippet('<span>Recibo</span>'),
		});

		expect(getElement(target, 'header', HTMLElement).dataset.print).toBe('hidden');
	});
});

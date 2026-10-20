// @vitest-environment happy-dom
import { createAttachmentKey } from 'svelte/attachments';
import { describe, expect, it, vi } from 'vitest';

import Box from '#lib/components/layout/Box.svelte';
import Card from '#lib/components/layout/Card.svelte';
import Column from '#lib/components/layout/Column.svelte';
import Columns from '#lib/components/layout/Columns.svelte';
import type { ColumnSize } from '#lib/components/layout/column-sizes.js';
import Section from '#lib/components/layout/Section.svelte';
import SectionHeading from '#lib/components/layout/SectionHeading.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

const content = htmlSnippet('<p>Conteúdo</p>');
const COLUMN_SIZES: ColumnSize[] = ['full', 'half', 'one-quarter', 'three-fifths', 2, 3, 4, 5, 10];

describe('Card', () => {
	it('renders as a form with the method, action and attachment', async () => {
		const attach = vi.fn();

		const target = await renderComponent(Card, {
			element: 'form',
			method: 'POST',
			action: '?/cadastrar',
			[createAttachmentKey()]: attach,
			children: content,
		});

		const form = getElement(target, 'form', HTMLFormElement);
		expect([form.getAttribute('method'), form.getAttribute('action')]).toEqual(['POST', '?/cadastrar']);
		expect(attach).toHaveBeenCalledWith(form);
	});

	it('renders as a section without inner padding', async () => {
		const target = await renderComponent(Card, {
			element: 'section',
			padded: false,
			id: 'resultados',
			children: content,
		});

		expect(getElement(target, 'section#resultados', HTMLElement).textContent).toBe('Conteúdo');
	});
});

describe('Column', () => {
	it.each(COLUMN_SIZES)('accepts the %s size in every width range', async (size) => {
		const target = await renderComponent(Column, {
			size,
			tablet: size,
			mobile: size,
			id: 'coluna',
			children: content,
		});

		expect(getElement(target, '#coluna', HTMLDivElement).textContent).toBe('Conteúdo');
	});
});

describe('SectionHeading', () => {
	it('renders the requested element with a decorative icon and unchanged text', async () => {
		const target = await renderComponent(SectionHeading, {
			element: 'legend',
			icon: 'fa-solid fa-book',
			children: htmlSnippet('<span>Dados do livro</span>'),
		});

		const heading = getElement(target, 'legend', HTMLLegendElement);
		expect(heading.textContent?.trim()).toBe('Dados do livro');
		expect(heading.querySelector('[aria-hidden="true"] i')).not.toBeNull();
	});

	it('renders a level-two heading without an icon by default', async () => {
		const target = await renderComponent(SectionHeading, { children: htmlSnippet('<span>Mural de avisos</span>') });

		const heading = getElement(target, 'h2', HTMLHeadingElement);

		expect(heading.textContent?.trim()).toBe('Mural de avisos');
		expect(heading.querySelector('[aria-hidden="true"]')).toBeNull();
	});
});

describe('content wrappers', () => {
	it.each([
		['Section', Section, 'section'],
		['Columns', Columns, 'div'],
		['Box', Box, 'div'],
		['Column', Column, 'div'],
	] as const)('renders %s as the expected element with forwarded attributes', async (_name, component, tag) => {
		const target = await renderComponent(component, { 'data-testid': 'invólucro', children: content });

		const wrapper = getElement(target, '[data-testid="invólucro"]', HTMLElement);

		expect(wrapper.tagName.toLowerCase()).toBe(tag);
		expect(wrapper.textContent).toBe('Conteúdo');
	});

	it('renders columns that stay side by side on mobile', async () => {
		const target = await renderComponent(Columns, { mobile: true, id: 'colunas', children: content });

		expect(getElement(target, '#colunas', HTMLDivElement).textContent).toBe('Conteúdo');
	});
});

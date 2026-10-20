// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import DataTable from '#lib/components/data/DataTable.svelte';
import Indicator from '#lib/components/data/Indicator.svelte';
import { getElement, htmlSnippet, renderComponent } from '../support/render-component.js';

describe('DataTable', () => {
	it('wraps the captioned table in the scroll container with the rows in its body', async () => {
		const target = await renderComponent(DataTable, {
			'data-testid': 'rolagem',
			caption: 'Resultados da consulta de livros',
			tableId: 'printable-content',
			head: htmlSnippet('<tr><th scope="col">Tombo</th><th scope="col">Título</th></tr>'),
			children: htmlSnippet('<tr><td>1001</td><td>Caminhos da Luz</td></tr>'),
		});

		const container = getElement(target, '[data-testid="rolagem"]', HTMLDivElement);
		const table = getElement(container, 'table#printable-content', HTMLTableElement);
		expect(table.caption?.textContent).toBe('Resultados da consulta de livros');
		expect(table.tHead?.textContent).toBe('TomboTítulo');
		expect([...table.querySelectorAll(':scope > tbody > tr')].map((row) => row.textContent)).toEqual([
			'1001Caminhos da Luz',
		]);
	});
});

describe('Indicator', () => {
	it('shows the skeleton instead of the value while loading', async () => {
		const target = await renderComponent(Indicator, {
			id: 'doacoes',
			label: 'Doações',
			icon: 'fa-solid fa-calculator',
			loading: true,
			value: htmlSnippet('<span>R$ 44,75</span>'),
		});

		const indicator = getElement(target, '#doacoes', HTMLElement);
		expect(indicator.textContent?.trim()).toBe('Doações');
		expect(indicator.querySelector('i')?.closest('[aria-hidden="true"]')).not.toBeNull();
		expect(indicator.querySelector(':scope > div[aria-hidden="true"]')).not.toBeNull();
		expect(indicator.querySelector('h2')).toBeNull();
	});

	it.each([
		['the highlight', { highlight: true }],
		['a value tone', { valueTone: 'success' as const }],
	])('shows the value in the same indicator after loading with %s', async (_style, style) => {
		const target = await renderComponent(Indicator, {
			...style,
			id: 'saldo',
			label: 'Saldo',
			icon: 'fa-solid fa-sack-dollar',
			value: htmlSnippet('<span>R$ 44,75</span>'),
		});

		const indicator = getElement(target, '#saldo', HTMLElement);

		expect(getElement(indicator, 'h2', HTMLHeadingElement).textContent?.trim()).toBe('R$ 44,75');
		expect(indicator.querySelector(':scope > div[aria-hidden="true"]')).toBeNull();
	});
});

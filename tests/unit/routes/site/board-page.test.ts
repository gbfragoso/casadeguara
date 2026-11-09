import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { parseRenderedBody } from '../../support/rendered-document';
import BoardPage from '../../../../src/routes/(site)/diretoria/+page.svelte';

const renderBoard = () => parseRenderedBody(render(BoardPage).body);

const readHeadings = (document: ReturnType<typeof renderBoard>, selector: string) =>
	[...document.querySelectorAll(selector)].map((heading) => heading.textContent?.trim());

describe('board page', () => {
	it('opens with the administrative term', () => {
		const document = renderBoard();

		expect(document.querySelector('h1 + p')?.textContent).toBe('Estrutura Administrativa de maio 2023 a maio 2025');
	});

	it('presents the offices, the coordinations, the advisers and the fiscal council in order', () => {
		const document = renderBoard();

		expect(readHeadings(document, 'h2')).toEqual([
			'Presidência',
			'Secretaria',
			'Tesouraria',
			'Supervisão Geral de todas as Coordenações',
			'Coordenações',
			'Assessores da Diretoria',
			'Conselho Fiscal',
		]);
	});

	it('lists the eight coordinations with their coordinators', () => {
		const document = renderBoard();

		const coordinations = readHeadings(document, '[aria-labelledby="titulo-coordenacoes"] h3');
		const names = document.querySelectorAll('[aria-labelledby="titulo-coordenacoes"] dd');

		expect(coordinations).toHaveLength(8);
		expect(coordinations[0]).toBe('Manjedoura Dr. Bezerra de Menezes');
		expect(names).toHaveLength(16);
	});

	it('names the president and the fiscal council', () => {
		const document = renderBoard();

		const text = document.body.textContent;

		expect(text).toContain('Carlson Lemos Xavier');
		expect(text).toContain('Marcelo Cesar Santos Vicente');
	});

	it('links to the statute served by the app', () => {
		const document = renderBoard();

		const statute = [...document.querySelectorAll('a')].find((link) => link.textContent?.includes('Estatuto'));

		expect(statute?.getAttribute('href')).toMatch(/estatuto-gecg-2023.*\.pdf$/);
		expect(statute?.closest('p')?.textContent?.replace(/\s+/g, ' ')).toContain('(PDF, 2,9 MB)');
	});
});

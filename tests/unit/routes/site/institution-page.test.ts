import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { parseRenderedBody } from '../../support/rendered-document';
import InstitutionPage from '../../../../src/routes/(site)/a-instituicao/+page.svelte';

const renderInstitution = () => parseRenderedBody(render(InstitutionPage).body);

describe('institution page', () => {
	it('tells the history from 1954 to the current doctrinal orientation', () => {
		const document = renderInstitution();

		const paragraphs = [...document.querySelectorAll('[aria-labelledby="titulo-historia"] > p')].map(
			(paragraph) => paragraph.textContent,
		);

		expect(document.querySelector('h1')?.textContent?.trim()).toBe('A instituição');
		expect(paragraphs).toHaveLength(7);
		expect(paragraphs[0]).toContain('remonta aos idos de 1954');
		expect(paragraphs.at(-1)).toContain('codificada por Allan Kardec');
	});

	it('lists the first board sworn in at the foundation', () => {
		const document = renderInstitution();

		const offices = [...document.querySelectorAll('[aria-labelledby="titulo-primeira-diretoria"] dl > div')].map(
			(entry) => [entry.querySelector('dt')?.textContent, entry.querySelector('dd')?.textContent],
		);

		expect(offices).toHaveLength(10);
		expect(offices[0]).toEqual(['Presidente de Honra', 'Omar Canna Brasil']);
		expect(offices.at(-1)).toEqual(['Presidente da Comissão de Construção', 'Eliés Haun']);
	});

	it('shows the six photos of the headquarters with their descriptions', () => {
		const document = renderInstitution();

		const photos = [...document.querySelectorAll('img')];

		expect(photos).toHaveLength(6);
		expect(photos.every((photo) => photo.getAttribute('alt')?.trim())).toBe(true);
		expect(document.querySelector('figcaption')?.textContent?.trim()).toBe('Fachada da sede');
	});
});

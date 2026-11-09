import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { findStudyMaterial } from '#lib/site/study-materials/index.js';
import type { StudyMaterialSlug } from '#lib/site/study-materials/slugs.js';

import { parseRenderedBody } from '../../support/rendered-document';
import StudyMaterialRoute from '../../../../src/routes/(site)/material-de-estudo/[material=material]/+page.svelte';

const renderStudyMaterial = (slug: StudyMaterialSlug) =>
	render(StudyMaterialRoute, { props: { data: { conteudo: findStudyMaterial(slug) } } });

const renderDocument = (slug: StudyMaterialSlug) => parseRenderedBody(renderStudyMaterial(slug).body);

const normalize = (text: string | null | undefined) => text?.replace(/\s+/g, ' ').trim();

const findLink = (document: ReturnType<typeof renderDocument>, name: string) =>
	[...document.querySelectorAll('a')].find((link) => normalize(link.textContent)?.startsWith(name));

describe('study material page', () => {
	it('opens with the material title and its introduction', () => {
		const document = renderDocument('curso-de-passes');

		expect(document.querySelector('h1')?.textContent?.trim()).toBe('O Passe Espírita');
		expect(document.querySelector('h1 + p')?.textContent).toBe(
			'Esta página disponibiliza o material de estudo necessário para o conhecimento do Passe Espírita.',
		);
	});

	it('titles the browser tab with the material and the Casa', () => {
		const { head } = renderStudyMaterial('codificacao');

		expect(head).toContain('<title>Codificação · Grupo Espírita Casa de Guará</title>');
	});

	it('offers each PDF as a download with its size', () => {
		const document = renderDocument('curso-de-passes');

		const download = findLink(document, 'Aula 13');

		expect(download?.hasAttribute('download')).toBe(true);
		expect(download?.getAttribute('href')).toMatch(/corrente-magnetica-aula-13\.pdf$/);
		expect(normalize(download?.textContent)).toBe(
			'Aula 13 – Rotina de funcionamento da Corrente Magnética PDF · 5,2 MB',
		);
	});

	it('points books kept in the library to the catalog', () => {
		const document = renderDocument('curso-de-passes');

		const book = findLink(document, 'Livro: Terapia pelos passes');

		expect(book?.getAttribute('href')).toBe('/acervo');
		expect(normalize(book?.textContent)).toContain('Disponível em nossa Biblioteca');
	});

	it('opens outside sources as external links', () => {
		const document = renderDocument('evangelho-no-lar');

		const gospel = findLink(document, 'O Evangelho Segundo o Espiritismo');

		expect(gospel?.getAttribute('rel')).toBe('external');
		expect(gospel?.getAttribute('href')).toBe(
			'https://www.febnet.org.br/blog/geral/divulgacao/downloads-divulgacao/obras-basicas/',
		);
	});

	it('numbers the qualification course videos', () => {
		const document = renderDocument('atendimento-fraterno');

		const videos = [...document.querySelectorAll('ol > li a')].map((link) => normalize(link.textContent));

		expect(videos).toHaveLength(18);
		expect(videos[0]).toBe('01 Introdução Vídeo no YouTube');
		expect(videos[17]).toBe('18 Encaminhamentos especializados Vídeo no YouTube');
	});

	it('nests the complementary works under their section', () => {
		const document = renderDocument('codificacao');

		const works = [...document.querySelectorAll('h3')].map((heading) => normalize(heading.textContent));

		expect(works).toEqual(['Obras Póstumas', 'O que é o Espiritismo']);
	});

	it('describes the book cover', () => {
		const document = renderDocument('atendimento-fraterno');

		expect(document.querySelector('img')?.getAttribute('alt')).toContain('Capa do livro Diálogo Fraterno');
	});
});

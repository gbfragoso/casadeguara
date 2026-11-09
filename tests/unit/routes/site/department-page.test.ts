import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { findDepartmentPage } from '#lib/site/department-pages/index.js';
import type { DepartmentPageSlug } from '#lib/site/department-pages/slugs.js';

import { parseRenderedBody } from '../../support/rendered-document';
import DepartmentRoute from '../../../../src/routes/(site)/departamentos/[departamento]/+page.svelte';

const renderDepartment = (slug: DepartmentPageSlug, resumo: string | null = null) => {
	const { body } = render(DepartmentRoute, { props: { data: { slug, conteudo: findDepartmentPage(slug), resumo } } });
	return parseRenderedBody(body);
};

type RenderedDocument = ReturnType<typeof parseRenderedBody>;

const readSection = (document: RenderedDocument, headingId: string) =>
	document.querySelector(`[aria-labelledby="${headingId}"]`)?.textContent?.replace(/\s+/g, ' ').trim();

const readTerms = (document: RenderedDocument, headingId: string) =>
	[...document.querySelectorAll(`[aria-labelledby="${headingId}"] dl > div`)].map((entry) => [
		entry.querySelector('dt')?.textContent,
		entry.querySelector('dd')?.textContent,
	]);

describe('department page', () => {
	it('opens with the department name and the homepage summary', () => {
		const document = renderDepartment('biblioteca', 'Aberta ao público, com empréstimo de livros espíritas.');

		expect(document.querySelector('h1')?.textContent?.trim()).toBe('Biblioteca Batuíra');
		expect(document.querySelector('h1 + p')?.textContent).toBe(
			'Aberta ao público, com empréstimo de livros espíritas.',
		);
	});

	it('describes the cover photo', () => {
		const document = renderDepartment('juventude');

		const cover = document.querySelector('img');

		expect(cover?.getAttribute('alt')).toBe(
			'Jovens da JEAR cantam acompanhados por um guitarrista no salão da Casa',
		);
	});

	it('lists the meeting hours', () => {
		const document = renderDepartment('evangelizacao');

		expect(readTerms(document, 'titulo-agenda')).toEqual([
			['Encontro com as crianças', 'Sábados, das 9h às 11h'],
			['Planejamento e avaliação', 'Quartas-feiras, às 19h'],
		]);
	});

	it('names the coordination from the board', () => {
		const document = renderDepartment('manjedoura');

		expect(readTerms(document, 'titulo-coordenacao')).toEqual([
			['Coordenadora', 'Clédna Actes Bittencourt'],
			['Coordenadora Adjunta', 'Rita de Cássia Rodrigues da Paixão'],
		]);
	});

	it('titles each coordination group when the department has several', () => {
		const document = renderDepartment('recanto');

		const groups = [...document.querySelectorAll('[aria-labelledby="titulo-coordenacao"] h3')].map(
			(heading) => heading.textContent,
		);

		expect(groups).toEqual([
			'Recanto de Potira – Núcleo de Promoção Social para Gestantes',
			'Área de Promoção Social',
			'Área de Saúde e de Orientação Jurídica',
		]);
	});

	it('shows the gallery photos with their descriptions', () => {
		const document = renderDepartment('evangelizacao');

		const photos = [...document.querySelectorAll('section ul img')];

		expect(photos).toHaveLength(13);
		expect(photos.every((photo) => photo.getAttribute('loading') === 'lazy' && photo.getAttribute('alt'))).toBe(
			true,
		);
	});

	it('explains how the Recanto follows each pregnant woman and how to help', () => {
		const document = renderDepartment('recanto');

		const program = readSection(document, 'titulo-acompanhamento');

		expect(program).toContain('Feira mensal');
		expect(program).toContain('Como ajudar');
	});

	it('keeps the Recanto programme off the other departments', () => {
		const document = renderDepartment('biblioteca');

		expect(document.querySelector('#titulo-acompanhamento')).toBeNull();
	});

	it('closes with the quotation and its source', () => {
		const document = renderDepartment('biblioteca');

		expect(document.querySelector('blockquote')?.textContent?.trim()).toBe(
			'“Ofereçamos nossas mãos ao trabalho e Jesus nô-las sustentará.”',
		);
		expect(document.querySelector('figcaption')?.textContent).toBe(
			'Batuíra in Mais Luz, Nas Tarefas da Alma, página 70',
		);
	});
});

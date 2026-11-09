import { describe, expect, it } from 'vitest';

import { INSTITUTION_DIRECTIONS_URL, INSTITUTION_MAP_EMBED_URL } from '#lib/brand/institution.js';
import { readLinks, readText, renderHome } from './home-page-support';

const renderEmptyHome = () => renderHome({ destaque: null, seguintes: [] });

describe('home page sections', () => {
	it('presents the four departments by their official names', () => {
		const document = renderEmptyHome();

		const names = [...document.querySelectorAll('#departamentos h3')].map((heading) => heading.textContent);

		expect(names).toEqual([
			'Biblioteca Batuíra',
			'Manjedoura Dr. Bezerra de Menezes',
			'Juventude Espírita Amélia Rodrigues (JEAR)',
			'Evangelização Infantil Meimei',
		]);
	});

	it('gives the Saturday groups their hours and age range', () => {
		const document = renderEmptyHome();

		expect(readText(document, '#departamentos')).toContain('Sábado, das 9h às 11h De 3 a 12 anos');
	});

	it('opens the Manjedoura on Friday afternoons to workers only', () => {
		const document = renderEmptyHome();

		expect(readText(document, '#departamentos')).toContain('Sexta, das 14h30 às 17h Somente para trabalhadores');
	});

	it('leads every department card to its own page and keeps the library catalogue link', () => {
		const document = renderEmptyHome();

		expect(readLinks(document, '#departamentos')).toEqual([
			['Saiba mais sobre Biblioteca Batuíra', '/departamentos/biblioteca'],
			['Consultar o acervo', '/acervo'],
			['Saiba mais sobre Manjedoura Dr. Bezerra de Menezes', '/departamentos/manjedoura'],
			['Saiba mais sobre Juventude Espírita Amélia Rodrigues (JEAR)', '/departamentos/juventude'],
			['Saiba mais sobre Evangelização Infantil Meimei', '/departamentos/evangelizacao'],
		]);
	});

	it('leads the Recanto section to the Recanto page', () => {
		const document = renderEmptyHome();

		expect(readLinks(document, '#recanto')).toEqual([
			['Saiba mais sobre o Recanto de Potira', '/departamentos/recanto'],
		]);
	});

	it('names the Recanto through its logo', () => {
		const document = renderEmptyHome();

		const logo = document.querySelector('#recanto h2 img');

		expect(logo?.getAttribute('alt')).toBe('Recanto de Potira, Núcleo de Promoção Social para Gestantes');
	});

	it('follows what each pregnant woman receives at the Recanto in the order of the pregnancy', () => {
		const document = renderEmptyHome();

		const stages = [...document.querySelectorAll('#recanto ol h3')].map((heading) => heading.textContent);

		expect(stages).toEqual(['Acompanhamento', 'Feira mensal', 'Oficinas', 'Enxoval']);
	});

	it('tells the visitor where to donate clothes and how to donate money to the Recanto', () => {
		const document = renderEmptyHome();

		const ways = [...document.querySelectorAll('#recanto ul li')].map((item) =>
			item.textContent?.replace(/\s+/g, ' ').trim(),
		);

		expect(ways).toEqual([
			'Doações de roupas podem ser feitas em nossa sede, na Rua Major Dórea, 86, Castália, Itabuna-BA.',
			'Doações em dinheiro podem ser feitas na nossa tesouraria ou através da chave PIX: 13.271.788/0001-12',
		]);
	});

	it('routes the visitor to the Casa and shows it on the map', () => {
		const document = renderEmptyHome();

		const map = document.querySelector('#como-chegar iframe');

		expect(readLinks(document, '#como-chegar')[0]).toEqual(['Traçar rota', INSTITUTION_DIRECTIONS_URL]);
		expect(map?.getAttribute('src')).toBe(INSTITUTION_MAP_EMBED_URL);
	});
});

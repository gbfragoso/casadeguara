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

	it('links the library to the public catalogue', () => {
		const document = renderEmptyHome();

		expect(readLinks(document, '#departamentos')).toEqual([['Consultar o acervo', '/acervo']]);
	});

	it('names the Recanto through its logo', () => {
		const document = renderEmptyHome();

		const logo = document.querySelector('#recanto h2 img');

		expect(logo?.getAttribute('alt')).toBe('Recanto de Potira, Núcleo de Promoção Social para Gestantes');
	});

	it('summarises what each pregnant woman receives at the Recanto', () => {
		const document = renderEmptyHome();

		const topics = [...document.querySelectorAll('#recanto h3')].map((heading) => heading.textContent);

		expect(topics).toEqual(['Acompanhamento', 'Feira mensal', 'Enxoval', 'Oficinas']);
	});

	it('routes the visitor to the Casa and shows it on the map', () => {
		const document = renderEmptyHome();

		const map = document.querySelector('#como-chegar iframe');

		expect(readLinks(document, '#como-chegar')[0]).toEqual(['Traçar rota', INSTITUTION_DIRECTIONS_URL]);
		expect(map?.getAttribute('src')).toBe(INSTITUTION_MAP_EMBED_URL);
	});

	it('closes with the contacts and the volunteer area in the footer', () => {
		const document = renderEmptyHome();

		const links = readLinks(document, 'footer');

		expect(links).toEqual(
			expect.arrayContaining([
				['contato@casadeguara.org', 'mailto:contato@casadeguara.org'],
				['Instagram', 'https://www.instagram.com/casadeguara/'],
				['YouTube', 'https://www.youtube.com/channel/UCFz1gRHG5bq750Nma0Ttc4w'],
				['Login', '/login'],
			]),
		);
	});

	it('links the volunteer area in the header to the login page', () => {
		const document = renderEmptyHome();

		expect(readLinks(document, 'header')).toContainEqual(['Login', '/login']);
	});
});

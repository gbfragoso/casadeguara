import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/comunicacao/palestrantes/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

const palestrantes = [
	{ id: 7, nome: 'Ana Amorim', temFoto: true, importado: false },
	{ id: 4, nome: 'Carmélia Amorim', temFoto: false, importado: true },
];

const renderList = (busca = 'amorim', items = palestrantes) =>
	parseRenderedBody(render(Page, { props: { data: { busca, palestrantes: items } } }).body);

describe('speaker list page', () => {
	it('opens under the module breadcrumb', () => {
		const document = renderList();

		const breadcrumb = [...document.querySelectorAll('nav a')].map((link) => link.getAttribute('href'));

		expect(document.querySelector('h1')?.textContent?.trim()).toBe('Palestrantes');
		expect(breadcrumb).toEqual(['/comunicacao', '/comunicacao/palestrantes']);
	});

	it('CA-30 lists the speakers in the loaded alphabetical order, linking to each page', () => {
		const document = renderList();

		const links = [...document.querySelectorAll('ul[aria-label="Palestrantes"] li a')].map((link) => [
			link.textContent?.trim(),
			link.getAttribute('href'),
		]);

		expect(links).toEqual([
			['Ana Amorim', '/comunicacao/palestrantes/7'],
			['Carmélia Amorim', '/comunicacao/palestrantes/4'],
		]);
	});

	it('CA-30 shows the photo thumbnail or a placeholder', () => {
		const [ana, carmelia] = [...renderList().querySelectorAll('ul[aria-label="Palestrantes"] li')];

		expect(ana.querySelector('img')?.getAttribute('src')).toBe('/comunicacao/palestrantes/7/foto/miniatura');
		expect(carmelia.querySelector('img')).toBeNull();
		expect(carmelia.querySelector('a > span[aria-hidden="true"]')).not.toBeNull();
	});

	it('CA-30 keeps the search term in the GET search field', () => {
		const document = renderList();

		const form = document.querySelector('form');
		expect([form?.getAttribute('method'), form?.getAttribute('action')]).toEqual([
			'GET',
			'/comunicacao/palestrantes',
		]);
		expect(document.querySelector('input[name="nome"]')?.getAttribute('value')).toBe('amorim');
	});

	it('marks the speakers imported from the Secretaria', () => {
		const [ana, carmelia] = [...renderList().querySelectorAll('ul[aria-label="Palestrantes"] li')];

		expect(ana.textContent).not.toContain('Importado do cadastro');
		expect(carmelia.textContent).toContain('Importado do cadastro');
	});

	it('offers the creation and the import', () => {
		const document = renderList();

		expect(document.querySelector('a[href="/comunicacao/palestrantes/novo"]')?.textContent?.trim()).toBe(
			'Novo palestrante',
		);
		expect(document.querySelector('a[href="/comunicacao/palestrantes/importar"]')?.textContent?.trim()).toBe(
			'Importar do cadastro',
		);
	});

	it('tells that no speaker matches the search', () => {
		expect(renderList('zzz', []).body.textContent).toContain('Nenhum palestrante encontrado.');
	});
});

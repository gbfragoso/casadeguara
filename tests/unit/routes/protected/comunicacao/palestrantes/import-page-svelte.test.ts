import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/comunicacao/palestrantes/importar/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

const candidatos = [
	{ cadastroId: 812, nome: 'Carmélia Amorim', temFoto: true, palestranteId: 4 },
	{ cadastroId: 901, nome: 'Paulo Amorim', temFoto: false, palestranteId: null },
];

const renderImport = (busca = 'amorim', items = candidatos, form: { mensagem: string } | null = null) =>
	parseRenderedBody(render(Page, { props: { data: { busca, candidatos: items }, form } }).body);

const rows = (document: ReturnType<typeof renderImport>) => [
	...document.querySelectorAll('ul[aria-label="Cadastros encontrados"] li'),
];

describe('speaker import page', () => {
	it('CA-32 marks an imported registration without an import button', () => {
		const [carmelia] = rows(renderImport());

		expect(carmelia.textContent).toContain('Já importado');
		expect(carmelia.querySelector('button')).toBeNull();
		expect(carmelia.querySelector('a')?.getAttribute('href')).toBe('/comunicacao/palestrantes/4');
	});

	it('imports a registration that is not a speaker yet', () => {
		const [, paulo] = rows(renderImport());

		const form = paulo.querySelector('form');
		expect(form?.getAttribute('action')).toBe('?/importar');
		expect(form?.querySelector('input[name="cadastroId"]')?.getAttribute('value')).toBe('901');
		expect(form?.querySelector('button')?.getAttribute('aria-label')).toBe('Importar Paulo Amorim');
	});

	it('tells whether each registration has a photo', () => {
		const [carmelia, paulo] = rows(renderImport());

		expect(carmelia.textContent).toContain('Com foto');
		expect(paulo.textContent).toContain('Sem foto');
	});

	it('shows no result list before a search', () => {
		const document = renderImport('', []);

		expect(document.querySelector('section[aria-label="Cadastros encontrados"]')).toBeNull();
	});

	it('tells that no registration matches the search', () => {
		expect(renderImport('zzz', []).body.textContent).toContain('Nenhum cadastro encontrado.');
	});

	it('alerts a refused import', () => {
		const document = renderImport('amorim', candidatos, { mensagem: 'Este cadastro já foi importado.' });

		expect(document.querySelector('[role="alert"]')?.textContent?.trim()).toBe('Este cadastro já foi importado.');
	});
});

import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/keywords/+page.svelte';

describe('keyword list page', () => {
	it('renders the initial search form', () => {
		const { body } = render(Page, { props: { form: { values: { chave: '' }, errors: {} } } });

		expect(body).toContain('Consulta de palavras-chave');
		expect(body).toContain('maxlength="30"');
		expect(body).not.toContain('required');
		expect(body).not.toContain('Nenhuma palavra-chave encontrada.');
	});

	it('renders a persisted search and Portuguese error', () => {
		const { body } = render(Page, {
			props: { form: { values: { chave: '123' }, errors: { chave: ['Palavra-chave inválida.'] } } },
		});

		expect(body).toContain('value="123"');
		expect(body).toContain('aria-describedby="chave-errors"');
		expect(body).toContain('Palavra-chave inválida.');
	});

	it('renders result rows with descriptive edit links', () => {
		const { body } = render(Page, {
			props: { form: { keywords: [{ idkeyword: 7, chave: 'FICÇÃO' }], values: { chave: 'Ficção' } } },
		});

		expect(body).toContain('<th>Palavra-chave</th>');
		expect(body).toContain('aria-label="Editar palavra-chave FICÇÃO"');
	});

	it('renders a completed-empty message', () => {
		const { body } = render(Page, { props: { form: { keywords: [], values: { chave: 'Ana' } } } });

		expect(body).toContain('Nenhuma palavra-chave encontrada.');
	});
});

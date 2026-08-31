import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.svelte';
import { getRenderedButton, getRenderedTextarea, parseRenderedBody } from '../../../../support/rendered-document';

const aviso = { idaviso: 7, dataCadastro: new Date('2026-08-20'), texto: 'Aviso carregado', username: 'bibliotecaria' };
const data = { username: 'bibliotecaria', userid: 'user-1', isAdmin: false, aviso };

describe('notice edit page', () => {
	it('renders the loaded notice with equivalent input constraints', () => {
		const { body } = render(Page, { props: { data, form: undefined } });
		const document = parseRenderedBody(body);
		const textarea = getRenderedTextarea(document, 'textarea[name="texto"]');

		expect(textarea.value).toBe(aviso.texto);
		expect(textarea.maxLength).toBe(300);
		expect(textarea.required).toBe(true);
	});

	it('preserves rejected text and associates every validation message', () => {
		const { body } = render(Page, {
			props: { data, form: { values: { texto: '' }, errors: { texto: ['Erro um', 'Erro dois'] } } },
		});
		const document = parseRenderedBody(body);
		const textarea = getRenderedTextarea(document, 'textarea[name="texto"]');

		expect(textarea.value).toBe('');
		expect(textarea.getAttribute('aria-describedby')).toBe('texto-errors');
		expect(textarea.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelectorAll('#texto-errors p')).toHaveLength(2);
	});

	it('renders an update confirmation and available submit control', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });
		const document = parseRenderedBody(body);
		const submit = getRenderedButton(document, 'button[type="submit"]');

		expect(document.body.textContent).toContain('Aviso atualizado com sucesso!');
		expect(submit.getAttribute('aria-busy')).toBe('false');
		expect(submit.disabled).toBe(false);
	});
});

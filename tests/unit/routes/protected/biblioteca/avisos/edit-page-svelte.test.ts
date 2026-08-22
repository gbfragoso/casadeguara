import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/avisos/[id=integer]/+page.svelte';

const aviso = { idaviso: 7, dataCadastro: new Date(), texto: 'Aviso carregado', username: 'bibliotecaria' };
const data = { username: 'bibliotecaria', userid: 'user-1', isAdmin: false, aviso };

describe('notice edit page', () => {
	it('renders the loaded notice with equivalent input constraints', () => {
		const { body } = render(Page, { props: { data, form: undefined } });

		expect(body).toContain(aviso.texto);
		expect(body).toContain('maxlength="300"');
		expect(body).toContain('required');
	});

	it('preserves rejected text and associates every validation message', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: { values: { texto: '' }, errors: { texto: ['Erro um', 'Erro dois'] } },
			},
		});

		expect(body).toContain('aria-describedby="texto-errors"');
		expect(body).toContain('aria-invalid="true"');
		expect(body).toContain('Erro um');
		expect(body).toContain('Erro dois');
		expect(body).not.toContain(`>${aviso.texto}</textarea>`);
	});

	it('renders an update confirmation', () => {
		const { body } = render(Page, { props: { data, form: { status: 200 } } });

		expect(body).toContain('Aviso atualizado com sucesso!');
	});

	it('renders the update control as available before a request', () => {
		const { body } = render(Page, { props: { data, form: undefined } });

		expect(body).toContain('aria-busy="false"');
		expect(body).toContain('type="submit"');
	});
});

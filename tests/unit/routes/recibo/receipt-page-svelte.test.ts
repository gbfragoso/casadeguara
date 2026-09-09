import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/recibo/active') } }));

import Page from '../../../../src/routes/recibo/[uuid=uuid]/+page.svelte';
import { parseRenderedBody } from '../../support/rendered-document';

const renderActiveReceipt = (valor: string) =>
	render(Page, {
		props: {
			data: {
				status: 'ativo',
				entrada: {
					id: 3568,
					valor,
					descricao: 'Mensalidade',
					contribuinte: 'Ana',
					dataEntrada: '2026-09-02',
					dataRegistro: '2026-09-02',
				},
			},
		},
	});

describe('public receipt page', () => {
	it('renders the active receipt document with its financial fields', () => {
		const { body } = renderActiveReceipt('1700');
		const document = parseRenderedBody(body);

		expect(document.querySelector('#recibo')?.textContent).toContain('ANA');
		expect(document.querySelector('#recibo')?.textContent).toContain('MENSALIDADE');
		expect(document.querySelector('#recibo')?.textContent).toContain('R$ 1.700,00');
		expect(document.querySelector('#recibo')?.textContent).toContain('MIL E SETECENTOS REAIS');
		expect(document.querySelector('button[aria-label="print"]')).not.toBeNull();
	});

	it.each([
		['123.23', 'R$ 123,23', 'CENTO E VINTE E TRÊS REAIS E VINTE E TRÊS CENTAVOS'],
		['1700.58', 'R$ 1.700,58', 'MIL E SETECENTOS REAIS E CINQUENTA E OITO CENTAVOS'],
	])('renders exact financial text for %s', (valor, formatted, words) => {
		const { body } = renderActiveReceipt(valor);
		const document = parseRenderedBody(body);
		const receiptText = document.querySelector('#recibo')?.textContent ?? '';

		expect(receiptText).toContain(formatted);
		expect(receiptText).toContain(words);
	});

	it('renders only the invalidation state and reason for a reversed receipt', () => {
		const { body } = render(Page, {
			props: {
				data: { status: 'estornado', motivo: 'Lançamento duplicado' },
			},
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('#recibo-estornado')?.textContent).toContain('Lançamento duplicado');
		expect(document.querySelector('#recibo')).toBeNull();
		expect(document.body.textContent).not.toContain('Conteúdo privado');
		expect(document.body.textContent).not.toContain('150.00');
	});
});

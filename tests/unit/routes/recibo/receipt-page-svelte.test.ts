import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/recibo/active') } }));

import Page from '../../../../src/routes/recibo/[uuid=uuid]/+page.svelte';
import { parseRenderedBody } from '../../support/rendered-document';

describe('public receipt page', () => {
	it('renders the active receipt document with its financial fields', () => {
		const { body } = render(Page, {
			props: {
				data: {
					status: 'ativo',
					entrada: {
						id: 4,
						valor: '10.00',
						descricao: 'Mensalidade',
						contribuinte: 'Ana',
						dataEntrada: '2026-09-02',
						dataRegistro: '2026-09-02',
					},
				},
			},
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('#recibo')?.textContent).toContain('ANA');
		expect(document.querySelector('#recibo')?.textContent).toContain('MENSALIDADE');
		expect(document.querySelector('button[aria-label="print"]')).not.toBeNull();
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

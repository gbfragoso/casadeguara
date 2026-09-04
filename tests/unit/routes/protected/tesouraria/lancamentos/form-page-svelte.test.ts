import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import CreatePage from '../../../../../../src/routes/(protected)/tesouraria/lancamentos/novo/+page.svelte';
import { getRenderedSelect, parseRenderedBody } from '../../../../support/rendered-document';

describe('novo lançamento page', () => {
	it('requires counterpart and exposes deposit control for entries', () => {
		const { body } = render(CreatePage, {
			props: {
				data: { username: 'Tesouraria', userid: 'u', isAdmin: false, contrapartes: [{ id: 7, nome: 'Ana' }] },
				form: {
					values: { tipo: 'entrada', contraparteId: '', depositado: '' },
					errors: { contraparteId: ['Contraparte obrigatória.'] },
				},
			},
		});
		const document = parseRenderedBody(body);
		const counterpart = getRenderedSelect(document, 'select[name="contraparteId"]');

		expect(counterpart?.required).toBe(true);
		expect(document.querySelector('input[name="depositado"]')).not.toBeNull();
		expect(document.querySelector('#contraparteId-errors')?.textContent).toContain('Contraparte obrigatória.');
		expect(counterpart?.getAttribute('aria-invalid')).toBe('true');
	});

	it('accepts an optional counterpart and hides entry-only fields for exits', () => {
		const { body } = render(CreatePage, {
			props: { form: { values: { tipo: 'saida', contraparteId: '' }, errors: {} } },
		});
		const document = parseRenderedBody(body);
		const counterpart = getRenderedSelect(document, 'select[name="contraparteId"]');

		expect(counterpart?.required).toBe(false);
		expect(document.querySelector('input[name="depositado"]')).toBeNull();
		expect(document.body.textContent).toContain('Saída');
	});
});

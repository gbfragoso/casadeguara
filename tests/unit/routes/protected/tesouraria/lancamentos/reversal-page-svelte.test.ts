// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/tesouraria/lancamentos/[id=integer]/estorno/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

vi.mock('$app/forms', () => ({ enhance: vi.fn() }));

const lancamento = {
	id: 12,
	tipo: 'entrada' as const,
	descricao: 'Mensalidade',
	valor: '150.00',
	dataLancamento: '2026-09-01',
	contraparte: { id: 7, nome: 'Ana' },
	depositado: false,
	reciboUuid: 'uuid-12',
	dataRegistro: '2026-09-01',
	estornado: false,
	motivoEstorno: null,
	usuarioEstorno: null,
	dataEstorno: null,
};
const data = { username: 'Tesouraria', userid: 'u', isAdmin: false, lancamento };

describe('lançamento reversal page', () => {
	it('summarizes the launch before asking for the reversal reason', async () => {
		const target = await renderComponent(Page, { data, form: null });

		const text = target.textContent ?? '';

		expect(text).toContain('Tipo: Entrada');
		expect(text).toContain('Contraparte: Ana');
		expect(text).toMatch(/Valor: R\$\s150,00/);
		expect(text).toContain('Data: 01/09/2026');
		expect(target.querySelector('label[for="motivo"]')?.textContent).toBe('Motivo do estorno');
		expect(target.querySelector('textarea#motivo')?.hasAttribute('required')).toBe(true);
	});

	it('associates and focuses the reason validation error', async () => {
		const target = await renderComponent(Page, {
			data,
			form: { values: { motivo: '' }, errors: { motivo: ['Motivo obrigatório.'] } },
		});

		const reason = target.querySelector('textarea#motivo');
		const error = target.querySelector('#motivo-errors');

		expect(reason?.getAttribute('aria-invalid')).toBe('true');
		expect(reason?.getAttribute('aria-describedby')).toBe('motivo-errors');
		expect(reason?.getAttribute('aria-errormessage')).toBe('motivo-errors');
		expect(error?.getAttribute('role')).toBe('alert');
		expect(error?.textContent).toContain('Motivo obrigatório.');
		expect(document.activeElement).toBe(error);
	});

	it.each([
		[{ status: 200, message: 'Lançamento estornado com sucesso.' }],
		[{ values: { motivo: 'Duplicado' }, message: 'Lançamento já estornado.' }],
	])('announces the reversal outcome %#', async (form) => {
		const target = await renderComponent(Page, { data, form });

		expect(target.querySelector('[role="alert"]')?.textContent?.trim()).toBe(form.message);
	});

	it('reports a missing launch without the reversal form', async () => {
		const target = await renderComponent(Page, { form: null });

		expect(target.querySelector('[role="alert"]')?.textContent).toContain('Lançamento não encontrado.');
		expect(target.querySelector('form')).toBeNull();
	});
});

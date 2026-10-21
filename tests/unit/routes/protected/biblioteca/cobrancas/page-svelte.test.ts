// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));

import Page from '../../../../../../src/routes/(protected)/biblioteca/cobrancas/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

type OverdueLoan = {
	idemp: number;
	idleitor: number;
	leitor: string;
	celular: string | null;
	telefone: string | null;
	email: string | null;
	cobranca: Date | null;
	titulo: string;
	numero: number;
	renovacoes: number | null;
	data_devolucao: Date | null;
	data_emprestimo: Date | null;
	data_devolvido: Date | null;
};

const overdueLoan = (overrides: Partial<OverdueLoan>): OverdueLoan => ({
	idemp: 51,
	idleitor: 7,
	leitor: 'Rui Leitor',
	celular: null,
	telefone: null,
	email: null,
	cobranca: null,
	titulo: 'Caminhos da Luz',
	numero: 2,
	renovacoes: 0,
	data_devolucao: new Date('2026-10-01T00:00:00Z'),
	data_emprestimo: new Date('2026-09-17T00:00:00Z'),
	data_devolvido: null,
	...overrides,
});

const renderCharges = (emprestimos: Promise<OverdueLoan[]>) => renderComponent(Page, { data: { emprestimos } });

const readRows = (target: HTMLElement) => [...target.querySelectorAll('tbody tr')];

describe('overdue loans page', () => {
	it('shows a loading placeholder while the overdue loans are pending', async () => {
		const target = await renderCharges(new Promise(() => undefined));

		const row = readRows(target)[0];

		expect(row?.querySelectorAll('td [aria-hidden="true"]')).toHaveLength(4);
		expect(row?.textContent?.trim()).toBe('');
	});

	it('lists an uncharged loan with one contact form for each reader contact', async () => {
		const loan = overdueLoan({ telefone: '7133333333', celular: '71987654321', email: 'rui@example.test' });

		const target = await renderCharges(Promise.resolve([loan]));

		await vi.waitFor(() => expect(readRows(target)[0]?.textContent).toContain('Rui Leitor'));
		const forms = [...target.querySelectorAll('tbody form')].map((form) => [
			form.getAttribute('action'),
			form.querySelector<HTMLInputElement>('input[name="telefone"], input[name="email"]')?.value,
		]);
		expect(readRows(target)[0]?.textContent).toContain('Não cobrado');
		expect(forms).toEqual([
			['?/whatsapp', '7133333333'],
			['?/whatsapp', '71987654321'],
			['?/email', 'rui@example.test'],
		]);
	});

	it('shows the charge date and no contact action for a reader without contacts', async () => {
		const loan = overdueLoan({ cobranca: new Date('2026-10-05T15:00:00Z') });

		const target = await renderCharges(Promise.resolve([loan]));

		await vi.waitFor(() => expect(readRows(target)[0]?.textContent).toContain('05/10/2026'));
		expect(readRows(target)[0]?.textContent).not.toContain('Não cobrado');
		expect(target.querySelectorAll('tbody form')).toHaveLength(0);
	});

	it('links the reader and sends the due date with each charge', async () => {
		const target = await renderCharges(Promise.resolve([overdueLoan({ email: 'rui@example.test' })]));

		await vi.waitFor(() => expect(target.querySelector('tbody a')?.textContent).toBe('Rui Leitor'));
		expect(target.querySelector('tbody a')?.getAttribute('href')).toBe('/biblioteca/leitores/7');
		expect(target.querySelector<HTMLInputElement>('input[name="prazo"]')?.value).toBe('01/10/2026');
	});

	it('shows no rows when no loan is overdue', async () => {
		const target = await renderCharges(Promise.resolve([]));

		await vi.waitFor(() => expect(readRows(target)).toHaveLength(0));
	});
});

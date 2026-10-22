// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));

import Page from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/[id=integer]/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

const data = {
	emprestimo: {
		leitor: 'Rui Leitor',
		livro: 'Caminhos da Luz',
		numero: 2,
		idexemplar: 41,
		idlivro: 7,
		usuarioEmprestimo: 'Helena',
		dataEmprestimo: new Date('2026-10-05T00:00:00Z'),
		dataDevolvido: null,
	},
	exemplares: Promise.resolve([]),
};

const renderEditPage = (form: { status: number } | null) => renderComponent(Page, { data, form });

describe('loan edit page', () => {
	it('shows the current loan as read-only context for the copy change', async () => {
		const target = await renderEditPage(null);

		const reader = target.querySelector<HTMLInputElement>('#leitor');

		expect([reader?.value, reader?.disabled]).toEqual(['Rui Leitor', true]);
		expect(target.querySelector<HTMLInputElement>('#exemplaratual')?.value).toBe('Caminhos da Luz - EX:2');
		expect(target.querySelector<HTMLInputElement>('#idexemplar')?.value).toBe('41');
		expect(target.querySelector('form')?.textContent).toContain('Emprestado por Helena no dia 05/10/2026');
		expect(target.querySelector('[data-testid="regiao-notificacao"]')).toBeNull();
	});

	it('requires the new copy', async () => {
		const target = await renderEditPage(null);

		expect(target.querySelector<HTMLSelectElement>('select#novoexemplar')?.required).toBe(true);
	});

	it('notifies the successful update', async () => {
		const target = await renderEditPage({ status: 200 });

		expect(target.querySelector('[data-testid="regiao-notificacao"]')?.textContent?.trim()).toBe(
			'Empréstimo atualizado com sucesso',
		);
	});
});

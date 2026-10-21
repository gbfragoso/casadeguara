// @vitest-environment happy-dom
import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

type Submit = () => (submission: { update: () => Promise<void> }) => Promise<void>;
const enhancerState = vi.hoisted(() => ({ submits: [] as Submit[] }));
vi.mock('$app/forms', () => ({
	enhance: (_form: unknown, submit?: Submit) => {
		if (submit) enhancerState.submits.push(submit);
	},
}));

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
	exemplares: Promise.resolve([
		{ idexemplar: 42, livro: 'Caminhos da Luz', numero: 3 },
		{ idexemplar: 43, livro: 'Caminhos da Luz', numero: 4 },
	]),
};

describe('loan edit page copies', () => {
	it('offers the available copies of the same book once they load', async () => {
		const target = await renderComponent(Page, { data, form: null });

		await vi.waitFor(() => expect(target.querySelectorAll('#novoexemplar option')).toHaveLength(3));
		const options = [...target.querySelectorAll('#novoexemplar option')].map((option) => [
			option.getAttribute('value'),
			option.textContent,
		]);
		expect(options).toEqual([
			['', ''],
			['42', 'Caminhos da Luz - EX:3'],
			['43', 'Caminhos da Luz - EX:4'],
		]);
	});

	it('shows the update as loading while the copy change is submitted', async () => {
		const target = await renderComponent(Page, { data, form: null });
		const updateButton = () => target.querySelector('button[type="submit"]')?.getAttribute('aria-busy');

		const finish = enhancerState.submits.at(-1)?.();
		flushSync();
		const whileLoading = updateButton();
		await finish?.({ update: async () => undefined });
		flushSync();

		expect([whileLoading, updateButton()]).toEqual(['true', 'false']);
	});
});

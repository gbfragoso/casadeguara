// @vitest-environment happy-dom
import type { ActionResult } from '$app/forms';
import { flushSync, tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import LancamentosTable from '#lib/components/tesouraria/LancamentosTable.svelte';
import type { SubmitAction } from '#lib/forms/action-request.js';
import { getElement, renderComponent } from '../support/render-component.js';

const items = [
	{
		id: 12,
		tipo: 'entrada' as const,
		descricao: 'Mensalidade',
		valor: '100.00',
		dataLancamento: '2026-09-01',
		contraparte: { nome: 'Ana' },
		reciboUuid: 'uuid-entry',
	},
	{
		id: 13,
		tipo: 'saida' as const,
		descricao: 'Material',
		valor: '25.00',
		dataLancamento: '2026-09-01',
		contraparte: null,
		reciboUuid: null,
	},
];

const savedResult = (descricao: string): ActionResult => ({
	type: 'success',
	status: 200,
	data: { id: 12, descricao },
	location: '/tesouraria/lancamentos',
});

const renderTable = (submit: SubmitAction) => renderComponent(LancamentosTable, { items, submit });

const editButton = (target: HTMLElement, id: number) =>
	getElement(target, `button[aria-label="Editar descrição do lançamento ${id}"]`, HTMLButtonElement);

const openEditor = async (target: HTMLElement, id: number) => {
	editButton(target, id).click();
	await tick();
	return getElement(target, `[aria-label="Descrição do lançamento ${id}"]`, HTMLInputElement);
};

const rowOf = (target: HTMLElement, id: number) =>
	[...target.querySelectorAll('tbody tr')].find((row) => row.querySelector('td')?.textContent === `${id}`);

describe('LancamentosTable', () => {
	it('shows the corrected description, announces it and returns focus to the edit button', async () => {
		const submit = vi.fn<SubmitAction>(() => Promise.resolve(savedResult('Mensalidade de outubro')));
		const target = await renderTable(submit);
		const input = await openEditor(target, 12);
		input.value = 'Mensalidade de outubro';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

		await vi.waitFor(() =>
			expect(target.querySelector('[role="status"]')?.textContent).toContain(
				'Descrição do lançamento 12 atualizada.',
			),
		);
		expect(submit).toHaveBeenCalledWith('?/editarDescricao', { id: '12', descricao: 'Mensalidade de outubro' });
		expect(rowOf(target, 12)?.textContent).toContain('Mensalidade de outubro');
		expect(target.querySelector('[aria-label="Descrição do lançamento 12"]')).toBeNull();
		expect(document.activeElement).toBe(editButton(target, 12));
	});

	it('keeps a single row in edition at a time', async () => {
		const target = await renderTable(vi.fn<SubmitAction>());
		await openEditor(target, 12);

		await openEditor(target, 13);

		expect(target.querySelectorAll('input[aria-label^="Descrição do lançamento"]')).toHaveLength(1);
		expect(target.querySelector('[aria-label="Descrição do lançamento 13"]')).not.toBeNull();
		expect(rowOf(target, 12)?.textContent).toContain('Mensalidade');
	});
});

// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/forms', () => ({ enhance: () => undefined }));

import Page from '../../../../../../src/routes/(protected)/biblioteca/livros/[id=integer]/exemplares/+page.svelte';
import { renderComponent } from '../../../../lib/components/support/render-component.js';

const REGISTERED_AT = new Date('2026-01-10T00:00:00Z');
const BOOK = {
	idlivro: 3,
	tombo: '1001',
	titulo: 'Caminhos da Luz',
	editora: 1,
	dataCadastro: REGISTERED_AT,
	serie: null,
	ordem: null,
};
const copy = (idexemplar: number, numero: number, status: string) => ({
	idexemplar,
	livro: 3,
	numero,
	status,
	dataCadastro: REGISTERED_AT,
});
const COPIES = [copy(11, 1, 'Disponível'), copy(12, 2, 'Arquivado'), copy(13, 3, 'Emprestado')];

type CopiesForm = { status: number } | null;

const renderCopies = (isAdmin: boolean, form: CopiesForm = null) =>
	renderComponent(Page, {
		data: { livros: Promise.resolve([BOOK]), exemplares: Promise.resolve(COPIES), isAdmin },
		form,
		params: { id: '3' },
	});

const readRows = async (target: HTMLElement) => {
	await vi.waitFor(() => expect(target.querySelectorAll('tbody tr')).toHaveLength(COPIES.length));
	return [...target.querySelectorAll('tbody tr')].map((row) => ({
		status: row.querySelectorAll('td')[2]?.textContent?.trim(),
		actions: [...row.querySelectorAll('button')].map((button) => button.getAttribute('aria-label')),
	}));
};

describe('book copies page', () => {
	it('shows the status of each copy and the registration date', async () => {
		const target = await renderCopies(false);

		const rows = await readRows(target);

		expect(rows.map(({ status }) => status)).toEqual(['Disponível', 'Arquivado', 'Emprestado']);
		expect(target.querySelector('tbody tr')?.textContent).toContain('10/01/2026');
	});

	it('hides the copy actions and their column from a non-administrator', async () => {
		const target = await renderCopies(false);

		const rows = await readRows(target);

		expect(rows.flatMap(({ actions }) => actions)).toEqual([]);
		expect([...target.querySelectorAll('thead th')].map((header) => header.textContent)).toEqual([
			'Ex',
			'Data cadastro',
			'Status',
		]);
	});

	it('offers an administrator the actions allowed by each copy status', async () => {
		const target = await renderCopies(true);

		const rows = await readRows(target);

		expect(rows.map(({ actions }) => actions)).toEqual([['Arquivar', 'trash'], ['Disponibilizar', 'trash'], []]);
	});

	it('pairs the labelled copy number field with the add button', async () => {
		const target = await renderCopies(false);

		const addButton = target.querySelector('#numero')?.parentElement?.querySelector('button[type="submit"]');

		expect(target.querySelector('label[for="numero"]')?.textContent).toBe('Número do exemplar');
		expect(addButton?.textContent?.trim()).toBe('Adicionar');
	});

	it.each([
		[201, 'Exemplar adicionado com sucesso!'],
		[200, 'Exemplar excluído com sucesso!'],
	])('confirms the copy operation answered with status %i', async (status, message) => {
		const target = await renderCopies(false, { status });

		expect(target.querySelector('form')?.textContent).toContain(message);
	});
});

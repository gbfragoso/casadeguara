import { render } from 'svelte/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

const TODAY = new Date('2026-10-20T12:00:00Z');

const loan = (idemp: number, overrides: Record<string, unknown>) => ({
	idemp,
	idleitor: 30 + idemp,
	exemplar: 40 + idemp,
	leitor: `Leitor ${idemp}`,
	telefone: null,
	titulo: `Livro ${idemp}`,
	numero: 1,
	renovacoes: 0,
	data_devolucao: new Date('2026-10-30T00:00:00Z'),
	data_emprestimo: new Date('2026-10-16T00:00:00Z'),
	data_devolvido: null,
	...overrides,
});

const LOANS = [
	loan(1, {}),
	loan(2, { data_devolucao: new Date('2026-10-01T00:00:00Z') }),
	loan(3, { data_devolvido: new Date('2026-10-18T00:00:00Z') }),
	loan(4, { renovacoes: 1 }),
];

type LoansForm = { emprestimos?: typeof LOANS; status?: number; message?: string } | null;

const renderLoans = (form: LoansForm, isAdmin = false) =>
	parseRenderedBody(render(Page, { props: { data: { isAdmin }, form } }).body);

const readRows = (form: LoansForm, isAdmin = false) =>
	[...renderLoans(form, isAdmin).querySelectorAll('tbody tr')].map((row) => ({
		status: row.querySelectorAll('td')[4]?.textContent?.trim(),
		actions: [...row.querySelectorAll('[aria-label]')].map((action) => action.getAttribute('aria-label')),
	}));

describe('loans page', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(TODAY);
	});

	afterEach(() => vi.useRealTimers());

	it('renders only the search form before a search', () => {
		const document = renderLoans(null);

		expect(document.querySelector('form #leitor')).not.toBeNull();
		expect(document.querySelector('table')).toBeNull();
		expect(document.querySelector('[data-testid="regiao-notificacao"]')).toBeNull();
	});

	it('shows the status and the available actions of each loan', () => {
		const rows = readRows({ emprestimos: LOANS, status: 200, message: 'OK' });

		expect(rows).toEqual([
			{ status: 'Ativo', actions: ['Editar', 'Renovar', 'Devolver', 'Recibo'] },
			{ status: 'Atrasado', actions: ['Editar', 'Renovar', 'Devolver', 'Recibo'] },
			{ status: 'Devolvido', actions: ['Recibo'] },
			{ status: 'Ativo', actions: ['Editar', 'Devolver', 'Recibo'] },
		]);
	});

	it('lets an administrator renew a loan that was already renewed', () => {
		const rows = readRows({ emprestimos: [LOANS[3]], status: 200, message: 'OK' }, true);

		expect(rows[0]?.actions).toContain('Renovar');
	});

	it('notifies a successful operation with the server message', () => {
		const document = renderLoans({ status: 201, message: 'Empréstimo registrado' });

		expect(document.querySelector('[data-testid="regiao-notificacao"]')?.textContent?.trim()).toBe(
			'Empréstimo registrado',
		);
	});

	it('notifies a failed operation with the server message', () => {
		const document = renderLoans({ status: 400, message: 'Falha na operação' });

		expect(document.querySelector('[data-testid="regiao-notificacao"]')?.textContent?.trim()).toBe(
			'Falha na operação',
		);
	});
});

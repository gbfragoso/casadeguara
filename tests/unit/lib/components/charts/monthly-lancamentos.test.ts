import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import MonthlyLancamentos from '$lib/components/charts/MonthlyLancamentos.svelte';
import { parseRenderedBody } from '../../../support/rendered-document';

const createTotals = (entradas: string, saidas: string) =>
	Array.from({ length: 12 }, (_, index) => ({
		competencia: `2025-${String(index + 1).padStart(2, '0')}`,
		entradas,
		saidas,
	}));

describe('MonthlyLancamentos', () => {
	it('renders named chart content and an equivalent twelve-row table in SSR', () => {
		const { body } = render(MonthlyLancamentos, {
			props: { totals: createTotals('1234.56', '78.9') },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('[role="region"]')).not.toBeNull();
		expect(document.querySelector('h2')?.textContent).toContain('Entradas e saídas');
		expect(document.querySelector('h2')?.textContent).toContain('últimos 12 meses');
		expect(document.querySelector('[aria-label="Legenda"]')?.textContent).toContain('Entradas');
		expect(document.querySelector('[aria-label="Legenda"]')?.textContent).toContain('Saídas');
		expect(document.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true');
		expect(document.querySelector('details summary')?.textContent).toContain('tabela');
		expect(document.querySelector('caption')?.textContent).toContain('por competência');
		expect(document.querySelectorAll('tbody tr')).toHaveLength(12);
		expect(document.querySelectorAll('tbody td')).toHaveLength(24);
		expect(document.body.textContent).toContain('R$ 1.234,56');
		expect(document.body.textContent).toContain('R$ 78,90');
	});

	it('announces the empty state without rendering a canvas', () => {
		const { body } = render(MonthlyLancamentos, {
			props: { totals: createTotals('0', '0') },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('[role="status"]')?.textContent).toContain(
			'Não há lançamentos ativos no período',
		);
		expect(document.querySelector('canvas')).toBeNull();
		expect(document.querySelectorAll('tbody tr')).toHaveLength(12);
		expect(document.querySelectorAll('tbody td')).toHaveLength(24);
		expect([...document.querySelectorAll('tbody td')].every((cell) => cell.textContent?.trim() === 'R$ 0,00')).toBe(
			true,
		);
	});
});

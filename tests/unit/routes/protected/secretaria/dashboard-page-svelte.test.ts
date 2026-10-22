// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import Page from '../../../../../src/routes/(protected)/secretaria/+page.svelte';
import { renderComponent } from '../../../lib/components/support/render-component.js';

type Counter = { counter: number }[];

const renderDashboard = (leitores: Promise<Counter>, engajamento: Promise<Counter>) =>
	renderComponent(Page, { data: { leitores, engajamento, username: 'Secretaria', userid: 'user-1' } });

const getIndicators = (target: HTMLElement) => [...target.querySelectorAll('[data-testid="indicadores"] article')];

describe('secretaria dashboard page', () => {
	it('shows each indicator label with a skeleton while the attendance is loading', async () => {
		const target = await renderDashboard(Promise.resolve([{ counter: 10 }]), new Promise(() => undefined));

		await vi.waitFor(() => expect(getIndicators(target)).toHaveLength(2));

		const indicators = getIndicators(target);
		expect(indicators.map((indicator) => indicator.querySelector('p')?.textContent?.trim())).toEqual([
			'Trabalhadores',
			expect.stringMatching(/^Frequência em [a-zç]+ de \d{4}$/),
		]);
		expect(indicators.every((indicator) => indicator.querySelector(':scope > div[aria-hidden="true"]'))).toBe(true);
		expect(target.querySelector('[data-testid="indicadores"] h2')).toBeNull();
	});

	it('shows the worker count and the monthly attendance rate once loaded', async () => {
		const target = await renderDashboard(Promise.resolve([{ counter: 10 }]), Promise.resolve([{ counter: 40 }]));

		await vi.waitFor(() => expect(target.querySelectorAll('[data-testid="indicadores"] h2')).toHaveLength(2));

		const values = [...target.querySelectorAll('[data-testid="indicadores"] h2')].map((value) =>
			value.textContent?.trim(),
		);
		expect(values).toEqual(['10', '50,00 %']);
	});

	it('shows a zero attendance rate when no worker is registered', async () => {
		const target = await renderDashboard(Promise.resolve([{ counter: 0 }]), Promise.resolve([{ counter: 0 }]));

		await vi.waitFor(() => expect(target.querySelectorAll('[data-testid="indicadores"] h2')).toHaveLength(2));

		expect(target.querySelectorAll('[data-testid="indicadores"] h2')[1]?.textContent?.trim()).toBe('0,00 %');
	});

	it('keeps the skeletons while the worker count is loading', async () => {
		const target = await renderDashboard(new Promise(() => undefined), new Promise(() => undefined));

		expect(getIndicators(target)).toHaveLength(2);
	});

	it('offers a retry when the indicators cannot be loaded', async () => {
		const target = await renderDashboard(Promise.reject(new Error('database offline')), Promise.resolve([]));

		await vi.waitFor(() => expect(target.querySelector('[role="alert"]')).not.toBeNull());
		expect(target.querySelector('[role="alert"]')?.textContent).toContain(
			'Não foi possível carregar os indicadores da secretaria.',
		);
	});
});

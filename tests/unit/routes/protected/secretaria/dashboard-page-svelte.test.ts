// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';

import Page from '../../../../../src/routes/(protected)/secretaria/+page.svelte';
import { renderComponent } from '../../../lib/components/support/render-component.js';

type Counter = { counter: number }[];

const renderDashboard = (leitores: Promise<Counter>) =>
	renderComponent(Page, { data: { leitores, username: 'Secretaria', userid: 'user-1' } });

const getIndicators = (target: HTMLElement) => [...target.querySelectorAll('[data-testid="indicadores"] article')];

describe('secretaria dashboard page', () => {
	it('shows the workers indicator with a skeleton while the count is loading', async () => {
		const target = await renderDashboard(new Promise(() => undefined));

		const indicators = getIndicators(target);
		expect(indicators.map((indicator) => indicator.querySelector('p')?.textContent?.trim())).toEqual([
			'Trabalhadores',
		]);
		expect(indicators[0]?.querySelector(':scope > div[aria-hidden="true"]')).not.toBeNull();
		expect(target.querySelector('[data-testid="indicadores"] h2')).toBeNull();
	});

	it('shows only the workers indicator once loaded', async () => {
		const target = await renderDashboard(Promise.resolve([{ counter: 10 }]));

		await vi.waitFor(() => expect(target.querySelector('[data-testid="indicadores"] h2')).not.toBeNull());

		expect(getIndicators(target)).toHaveLength(1);
		expect(target.querySelector('[data-testid="indicadores"] h2')?.textContent?.trim()).toBe('10');
		expect(target.textContent).not.toContain('Frequência em');
	});

	it('offers a retry when the indicators cannot be loaded', async () => {
		const target = await renderDashboard(Promise.reject(new Error('database offline')));

		await vi.waitFor(() => expect(target.querySelector('[role="alert"]')).not.toBeNull());
		expect(target.querySelector('[role="alert"]')?.textContent).toContain(
			'Não foi possível carregar os indicadores da secretaria.',
		);
	});
});

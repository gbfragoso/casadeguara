// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import AttendanceFilters from '#lib/components/forms/AttendanceFilters.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

describe('AttendanceFilters', () => {
	it('names each date field by its visible label', async () => {
		const target = await renderComponent(AttendanceFilters, {});

		const names = ['dataInicio', 'dataFim'].map((id) => {
			const input = getElement(target, `#${id}`, HTMLInputElement);
			return [input.getAttribute('aria-label'), target.querySelector(`label[for="${id}"]`)?.textContent];
		});

		expect(names).toEqual([
			[null, 'Data inicial'],
			[null, 'Data final'],
		]);
	});

	it('does not let the final date precede the initial date', async () => {
		const target = await renderComponent(AttendanceFilters, {});
		const start = getElement(target, '#dataInicio', HTMLInputElement);

		start.value = '2026-10-05';
		start.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();

		expect(getElement(target, '#dataFim', HTMLInputElement).min).toBe('2026-10-05');
	});
});

// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import AttendanceListFields from '#lib/components/forms/AttendanceListFields.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

const readDescription = (target: HTMLElement, element: Element) =>
	(element.getAttribute('aria-describedby') ?? '')
		.split(' ')
		.map((id) => target.querySelector(`[id="${id}"]`)?.textContent?.trim());

describe('TU-31 AttendanceListFields', () => {
	it('preselects Monday, Tuesday and Thursday', async () => {
		const target = await renderComponent(AttendanceListFields, {});

		const checked = [...target.querySelectorAll<HTMLInputElement>('input[name="dias"]:checked')].map(
			(input) => input.value,
		);

		expect(checked).toEqual(['1', '2', '4']);
	});

	it('labels every field and groups the weekdays', async () => {
		const target = await renderComponent(AttendanceListFields, {});

		const labels = ['titulo', 'dataInicio', 'dataFim'].map(
			(id) => target.querySelector(`label[for="${id}"]`)?.textContent,
		);

		expect(labels).toEqual(['Título da lista', 'Data inicial', 'Data final']);
		expect(target.querySelector('fieldset > legend')?.textContent).toBe('Dias da semana');
	});

	it('does not let the final date precede the initial date', async () => {
		const target = await renderComponent(AttendanceListFields, {});
		const start = getElement(target, '#dataInicio', HTMLInputElement);

		start.value = '2026-10-05';
		start.dispatchEvent(new Event('input', { bubbles: true }));
		await tick();

		expect(getElement(target, '#dataFim', HTMLInputElement).min).toBe('2026-10-05');
	});
});

describe('AttendanceListFields messages', () => {
	it('links each message to the field it describes', async () => {
		const target = await renderComponent(AttendanceListFields, {
			issues: [
				{ field: 'titulo', message: 'Título inválido.' },
				{ field: 'periodo', message: 'Período inválido.' },
				{ field: 'dias', message: 'Dias inválidos.' },
			],
		});

		const descriptions = ['#titulo', '#dataFim', 'fieldset'].map((selector) =>
			readDescription(target, getElement(target, selector, HTMLElement)),
		);

		expect(descriptions).toEqual([['Título inválido.'], ['Período inválido.'], ['Dias inválidos.']]);
	});

	it('marks only the fields with a message as invalid', async () => {
		const target = await renderComponent(AttendanceListFields, {
			issues: [{ field: 'periodo', message: 'Período inválido.' }],
		});

		const invalid = [...target.querySelectorAll('[aria-invalid="true"]')].map((element) => element.id);

		expect(invalid).toEqual(['dataFim']);
	});
});

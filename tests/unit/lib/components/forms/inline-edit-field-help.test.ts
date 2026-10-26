// @vitest-environment happy-dom
import { flushSync, tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import InlineEditField from '#lib/components/forms/InlineEditField.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

const HELP = 'Aparece na arte de divulgação, abaixo do título.';

const renderField = (help?: string) =>
	renderComponent(InlineEditField, {
		id: 'palestra-31-observacoes',
		label: 'Observações',
		type: 'textarea',
		value: '(Cap. IV)',
		help,
		onSave: () => Promise.resolve({ ok: false, message: 'Outra pessoa alterou esta programação.' }),
	});

const readTrigger = (target: HTMLElement) => getElement(target, 'button', HTMLButtonElement);

const readDescription = (element: HTMLElement) =>
	(element.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent);

describe('TU-29 InlineEditField help', () => {
	it('describes the edit button with its help text', async () => {
		const target = await renderField(HELP);

		expect(readDescription(readTrigger(target))).toEqual([HELP]);
	});

	it('describes the editor with its help text', async () => {
		const target = await renderField(HELP);
		readTrigger(target).click();
		await tick();

		const editor = getElement(target, 'textarea', HTMLTextAreaElement);

		expect(readDescription(editor)).toEqual([HELP]);
	});

	it('describes the edit button with the help text and the save failure', async () => {
		const target = await renderField(HELP);
		readTrigger(target).click();
		await tick();
		const editor = getElement(target, 'textarea', HTMLTextAreaElement);
		editor.value = '(Cap. V)';
		editor.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		editor.blur();

		await vi.waitFor(() =>
			expect(readDescription(readTrigger(target))).toEqual([HELP, 'Outra pessoa alterou esta programação.']),
		);
	});

	it('leaves a field without help undescribed', async () => {
		const target = await renderField();

		expect(readTrigger(target).hasAttribute('aria-describedby')).toBe(false);
	});
});

// @vitest-environment happy-dom
import { flushSync, tick, type ComponentProps } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import InlineEditField from '#lib/components/forms/InlineEditField.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

type FieldProps = ComponentProps<typeof InlineEditField>;

const saved = () => Promise.resolve({ ok: true as const });

const renderField = async (props: Partial<FieldProps> = {}) => {
	const onSave = vi.fn<FieldProps['onSave']>(props.onSave ?? saved);
	const target = await renderComponent(InlineEditField, {
		id: 'palestra-31-titulo',
		label: 'Título',
		value: 'A prece',
		...props,
		onSave,
	});
	return { target, onSave };
};

const openEditor = async (target: HTMLElement) => {
	getElement(target, 'button', HTMLButtonElement).click();
	await tick();
	return getElement(target, '[aria-label="Título"], [aria-label="Observações"]', HTMLElement);
};

const typeValue = (control: HTMLElement, value: string) => {
	if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)) {
		throw new Error('Campo de edição não encontrado.');
	}
	control.value = value;
	control.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
};

const pressKey = async (control: HTMLElement, key: string) => {
	control.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
	await tick();
};

const readTrigger = (target: HTMLElement) => getElement(target, 'button', HTMLButtonElement);

describe('InlineEditField', () => {
	it('shows the value as an editable button with an accessible label', async () => {
		const { target } = await renderField();

		expect(readTrigger(target).getAttribute('aria-label')).toBe('Editar título: A prece');
	});

	it('shows an empty value as "a definir"', async () => {
		const { target } = await renderField({ value: null });

		expect(readTrigger(target).textContent?.trim()).toBe('a definir');
	});

	it('restores the previous value without saving when Escape is pressed', async () => {
		const { target, onSave } = await renderField();
		const input = await openEditor(target);
		typeValue(input, 'Outro título');

		await pressKey(input, 'Escape');

		expect(onSave).not.toHaveBeenCalled();
		expect(readTrigger(target).textContent?.trim()).toBe('A prece');
		expect(document.activeElement).toBe(readTrigger(target));
	});

	it('saves the edited value when Enter is pressed', async () => {
		const { target, onSave } = await renderField();
		const input = await openEditor(target);
		typeValue(input, 'O passe');

		await pressKey(input, 'Enter');

		await vi.waitFor(() => expect(target.querySelector('[role="status"]')?.textContent).toBe('Salvo'));
		expect(onSave).toHaveBeenCalledWith('O passe');
		expect(readTrigger(target).textContent?.trim()).toBe('O passe');
	});

	it('saves the edited value when the field loses focus', async () => {
		const { target, onSave } = await renderField();
		const input = await openEditor(target);
		typeValue(input, 'O passe');

		input.blur();
		await tick();

		expect(onSave).toHaveBeenCalledWith('O passe');
	});

	it('does not save an unchanged value', async () => {
		const { target, onSave } = await renderField();
		const input = await openEditor(target);

		await pressKey(input, 'Enter');

		expect(onSave).not.toHaveBeenCalled();
	});

	it('keeps editing notes on Enter and saves them only on blur', async () => {
		const { target, onSave } = await renderField({ label: 'Observações', type: 'textarea', value: null });
		const notes = await openEditor(target);
		typeValue(notes, 'Livro: Jesus e Atualidade,\nCap. 20');

		await pressKey(notes, 'Enter');
		const savedOnEnter = onSave.mock.calls.length;
		notes.blur();
		await tick();

		expect(savedOnEnter).toBe(0);
		expect(onSave).toHaveBeenCalledWith('Livro: Jesus e Atualidade,\nCap. 20');
	});

	it('reverts the value and shows the reason when saving fails', async () => {
		const message = 'Outra pessoa alterou esta programação.';
		const onSave = vi.fn<FieldProps['onSave']>(() => Promise.resolve({ ok: false, message }));
		const { target } = await renderField({ onSave });
		const input = await openEditor(target);
		typeValue(input, 'O passe');

		await pressKey(input, 'Enter');

		await vi.waitFor(() => expect(target.querySelector('[role="alert"]')?.textContent).toBe(message));
		expect(readTrigger(target).textContent?.trim()).toBe('A prece');
		expect(readTrigger(target).getAttribute('aria-describedby')).toBe('palestra-31-titulo-error');
	});

	it('rejects an invalid value before saving and restores the previous one', async () => {
		const limit = 'O título deve ter até 120 caracteres.';
		const { target, onSave } = await renderField({ validate: (text) => (text.length > 120 ? limit : null) });
		const input = await openEditor(target);
		typeValue(input, 'x'.repeat(121));

		await pressKey(input, 'Enter');

		expect(onSave).not.toHaveBeenCalled();
		expect(target.querySelector('[role="alert"]')?.textContent).toBe(limit);
		expect(readTrigger(target).textContent?.trim()).toBe('A prece');
	});

	it('shows a read-only value without an edit control', async () => {
		const { target } = await renderField({ readonly: true });

		expect(target.querySelector('button')).toBeNull();
		expect(target.textContent).toContain('A prece');
	});
});

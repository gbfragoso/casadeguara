// @vitest-environment happy-dom
import { flushSync, tick, type ComponentProps } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import DescriptionEditor from '#lib/components/tesouraria/DescriptionEditor.svelte';
import { getElement, renderComponent } from '../support/render-component.js';

type EditorProps = ComponentProps<typeof DescriptionEditor>;
type SaveResult = Awaited<ReturnType<EditorProps['onSave']>>;

const saved = () => Promise.resolve<SaveResult>({ ok: true });

const renderEditor = async (onSaveImplementation: EditorProps['onSave'] = saved) => {
	const onSave = vi.fn<EditorProps['onSave']>(onSaveImplementation);
	const onCancel = vi.fn<EditorProps['onCancel']>();
	const target = await renderComponent(DescriptionEditor, {
		lancamentoId: 12,
		value: 'Mensalidade',
		onSave,
		onCancel,
	});
	const input = getElement(target, '[aria-label="Descrição do lançamento 12"]', HTMLInputElement);
	return { target, input, onSave, onCancel };
};

const typeValue = (input: HTMLInputElement, value: string) => {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
};

const pressKey = async (input: HTMLInputElement, key: string) => {
	input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
	await tick();
};

const button = (target: HTMLElement, name: string) =>
	getElement(target, `button[aria-label="${name}"]`, HTMLButtonElement);

describe('DescriptionEditor', () => {
	it('opens with the current description focused', async () => {
		const { input } = await renderEditor();

		expect(input.value).toBe('Mensalidade');
		expect(document.activeElement).toBe(input);
	});

	it('saves the normalized description when Enter is pressed', async () => {
		const { input, onSave } = await renderEditor();
		typeValue(input, '  Mensalidade de outubro  ');

		await pressKey(input, 'Enter');

		expect(onSave).toHaveBeenCalledExactlyOnceWith('Mensalidade de outubro');
	});

	it('saves only once while the save button is clicked and Enter is pressed again', async () => {
		const { target, input, onSave } = await renderEditor(() => new Promise<SaveResult>(() => undefined));
		typeValue(input, 'Mensalidade de outubro');

		button(target, 'Salvar descrição').click();
		await tick();
		await pressKey(input, 'Enter');

		expect(onSave).toHaveBeenCalledOnce();
		expect(button(target, 'Salvar descrição').disabled).toBe(true);
		expect(input.getAttribute('aria-busy')).toBe('true');
	});

	it('does not cancel with Escape while the description is being saved', async () => {
		const { input, onCancel } = await renderEditor(() => new Promise<SaveResult>(() => undefined));
		typeValue(input, 'Mensalidade de outubro');
		await pressKey(input, 'Enter');

		await pressKey(input, 'Escape');

		expect(onCancel).not.toHaveBeenCalled();
	});

	it('does not save the Enter that confirms a text composition', async () => {
		const { input, onSave } = await renderEditor();
		typeValue(input, 'Mensalidade de outubro');

		input.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true }),
		);
		await tick();

		expect(onSave).not.toHaveBeenCalled();
	});

	it('shows the validation error without calling onSave', async () => {
		const { target, input, onSave } = await renderEditor();
		typeValue(input, '12345');

		await pressKey(input, 'Enter');

		expect(onSave).not.toHaveBeenCalled();
		expect(target.querySelector('[role="alert"]')?.textContent).toContain(
			'Descrição não pode conter somente números.',
		);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe(target.querySelector('[role="alert"]')?.id);
	});

	it('keeps editing and shows the server failure', async () => {
		const { target, input, onCancel } = await renderEditor(() =>
			Promise.resolve({ ok: false, message: 'Lançamento já estornado.' }),
		);
		typeValue(input, 'Mensalidade de outubro');

		await pressKey(input, 'Enter');

		await vi.waitFor(() =>
			expect(target.querySelector('[role="alert"]')?.textContent).toContain('Lançamento já estornado.'),
		);
		expect(onCancel).not.toHaveBeenCalled();
		expect(input.value).toBe('Mensalidade de outubro');
		expect(button(target, 'Salvar descrição').disabled).toBe(false);
	});

	it('cancels when Escape is pressed', async () => {
		const { input, onSave, onCancel } = await renderEditor();
		typeValue(input, 'Outro texto');

		await pressKey(input, 'Escape');

		expect(onCancel).toHaveBeenCalledOnce();
		expect(onSave).not.toHaveBeenCalled();
	});

	it('cancels when "Cancelar edição" is clicked', async () => {
		const { target, onSave, onCancel } = await renderEditor();

		button(target, 'Cancelar edição').click();
		await tick();

		expect(onCancel).toHaveBeenCalledOnce();
		expect(onSave).not.toHaveBeenCalled();
	});

	it('closes without saving when the normalized text did not change', async () => {
		const { input, onSave, onCancel } = await renderEditor();
		typeValue(input, ' Mensalidade ');

		await pressKey(input, 'Enter');

		expect(onSave).not.toHaveBeenCalled();
		expect(onCancel).toHaveBeenCalledOnce();
	});
});

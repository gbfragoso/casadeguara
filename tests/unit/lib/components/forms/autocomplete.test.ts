// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { getOption, renderAutocomplete, typeQuery } from './autocomplete-support';

describe('Autocomplete selection', () => {
	it('opens all cadastros on focus and exposes an accessible suggestion list', async () => {
		const { input } = await renderAutocomplete();

		input.focus();
		await tick();

		expect(document.querySelectorAll('[role="option"]')).toHaveLength(3);
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(input.getAttribute('aria-controls')).toBe(document.querySelector('[role="listbox"]')?.id);
		expect(input.getAttribute('aria-autocomplete')).toBe('list');
	});

	it.each(['clicio fogaca', 'CLICIO FOGACA', 'clicio fogaça'])(
		'suggests original names when typing %s',
		async (query) => {
			const { input } = await renderAutocomplete();

			await typeQuery(input, query);

			expect(document.querySelectorAll('[role="option"]')).toHaveLength(2);
			expect(getOption('7').textContent).toContain('Clício Fogaça');
			expect(getOption('9').textContent).toContain('Cadastro #9');
		},
	);

	it('selects the clicked cadastro ID among identical names without submitting the form', async () => {
		const { form, input } = await renderAutocomplete();
		await typeQuery(input, 'clicio');
		const option = getOption('9');
		const pointer = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });

		option.dispatchEvent(pointer);
		option.click();
		await tick();

		expect(pointer.defaultPrevented).toBe(true);
		expect(option.type).toBe('button');
		expect(new FormData(form).get('contraparteId')).toBe('9');
		expect(input.value).toBe('Clício Fogaça');
		expect(input.checkValidity()).toBe(true);
		expect(input.getAttribute('aria-expanded')).toBe('false');
	});

	it('clears a selected ID immediately when the displayed name is edited', async () => {
		const { form, input } = await renderAutocomplete({ value: '7' });

		await typeQuery(input, 'Clébio');

		expect(new FormData(form).get('contraparteId')).toBe('');
		expect(input.value).toBe('Clébio');
		expect(input.validationMessage).toBe('Selecione um cadastro da lista.');
		expect(document.querySelectorAll('[role="option"]')).toHaveLength(1);
	});

	it('allows an optional selection to be cleared', async () => {
		const { form, input } = await renderAutocomplete({ value: '7' });

		await typeQuery(input, '');

		expect(new FormData(form).get('contraparteId')).toBe('');
		expect(input.checkValidity()).toBe(true);
	});

	it('requires a valid selection even when the typed name exactly matches an option', async () => {
		const { form, input } = await renderAutocomplete({ required: true });

		await typeQuery(input, 'Clício Fogaça');

		expect(input.checkValidity()).toBe(false);
		expect(new FormData(form).get('contraparteId')).toBe('');
	});

	it('announces an unknown cadastro and rejects its text even for optional fields', async () => {
		const { input } = await renderAutocomplete();

		await typeQuery(input, 'Nome inexistente');

		expect(document.querySelector('[role="status"]')?.textContent).toBe('Nenhum cadastro encontrado.');
		expect(input.checkValidity()).toBe(false);
	});

	it('restores a selected name, ID and associated server error', async () => {
		const props = {
			value: '8',
			invalid: 'true',
			describedBy: 'cadastro-errors',
			required: true,
		} satisfies Parameters<typeof renderAutocomplete>[0];

		const { input, form } = await renderAutocomplete(props);

		expect(input.value).toBe('Clébio Medeiros Fragoso');
		expect(new FormData(form).get('contraparteId')).toBe('8');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe('cadastro-errors');
	});
});

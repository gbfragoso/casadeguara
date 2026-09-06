// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { getOption, pressKey, renderAutocomplete, typeQuery } from './autocomplete-support';

describe('Autocomplete keyboard', () => {
	it('selects a suggestion with arrows and Enter while keeping focus in the input', async () => {
		const { form, input } = await renderAutocomplete();
		await typeQuery(input, 'clicio');
		await pressKey(input, 'ArrowDown');

		const event = await pressKey(input, 'Enter');

		expect(event.defaultPrevented).toBe(true);
		expect(new FormData(form).get('contraparteId')).toBe('7');
		expect(document.activeElement).toBe(input);
		expect(input.getAttribute('aria-expanded')).toBe('false');
	});

	it('exposes the active option and keeps navigation within the list', async () => {
		const { input } = await renderAutocomplete();
		await typeQuery(input, 'clicio');

		await pressKey(input, 'ArrowUp');
		expect(input.getAttribute('aria-activedescendant')).toBe(getOption('9').id);
		await pressKey(input, 'ArrowDown');
		expect(input.getAttribute('aria-activedescendant')).toBe(getOption('9').id);
		await pressKey(input, 'ArrowUp');
		await pressKey(input, 'ArrowUp');

		expect(input.getAttribute('aria-activedescendant')).toBe(getOption('7').id);
		expect(getOption('7').getAttribute('aria-selected')).toBe('true');
	});

	it.each(['Escape', 'Tab'])('closes without selecting when pressing %s', async (key) => {
		const { form, input } = await renderAutocomplete();
		await typeQuery(input, 'clicio');
		await pressKey(input, 'ArrowDown');

		const event = await pressKey(input, key);

		expect(input.getAttribute('aria-expanded')).toBe('false');
		expect(input.hasAttribute('aria-activedescendant')).toBe(false);
		expect(input.value).toBe('clicio');
		expect(new FormData(form).get('contraparteId')).toBe('');
		expect(event.defaultPrevented).toBe(key === 'Escape');
	});

	it('does not submit or select on Enter before highlighting an option', async () => {
		const { form, input } = await renderAutocomplete();
		await typeQuery(input, 'clicio');

		const event = await pressKey(input, 'Enter');

		expect(event.defaultPrevented).toBe(true);
		expect(new FormData(form).get('contraparteId')).toBe('');
	});

	it('allows Enter to submit an already confirmed selection with the list closed', async () => {
		const { input } = await renderAutocomplete({ value: '7' });

		const event = await pressKey(input, 'Enter');

		expect(event.defaultPrevented).toBe(false);
		expect(input.checkValidity()).toBe(true);
	});

	it('leaves text composition and normal text editing keys to the browser', async () => {
		const { input } = await renderAutocomplete();
		await typeQuery(input, 'cli');

		const composing = await pressKey(input, 'Enter', true);
		const editing = await pressKey(input, 'ArrowLeft');

		expect(composing.defaultPrevented).toBe(false);
		expect(editing.defaultPrevented).toBe(false);
		expect(input.getAttribute('aria-expanded')).toBe('true');
	});

	it('handles arrows and Enter with no matching cadastros', async () => {
		const { form, input } = await renderAutocomplete({ options: [] });
		await typeQuery(input, 'clicio');

		await pressKey(input, 'ArrowDown');
		await pressKey(input, 'ArrowUp');
		await pressKey(input, 'Enter');

		expect(input.hasAttribute('aria-activedescendant')).toBe(false);
		expect(new FormData(form).get('contraparteId')).toBe('');
	});

	it('closes the popup on blur', async () => {
		const { input } = await renderAutocomplete();
		await typeQuery(input, 'clicio');

		input.blur();
		await tick();

		expect(input.getAttribute('aria-expanded')).toBe('false');
	});
});

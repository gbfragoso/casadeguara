// @vitest-environment happy-dom
import { mount, tick, unmount, type ComponentProps } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import BrlAmountInput from '$lib/components/forms/BrlAmountInput.svelte';
import { createAmountProps } from './brl-amount-input-support.svelte';

let mounted: ReturnType<typeof mount> | undefined;

afterEach(async () => {
	if (mounted) await unmount(mounted);
	mounted = undefined;
	document.body.replaceChildren();
});

async function renderAmount(props: Partial<ComponentProps<typeof BrlAmountInput>> = {}) {
	const form = document.createElement('form');
	const target = document.createElement('div');
	form.append(target);
	document.body.append(form);
	const componentProps = createAmountProps(props);
	mounted = mount(BrlAmountInput, { target, props: componentProps });
	await tick();
	const input = form.querySelector('#valor');
	if (!(input instanceof HTMLInputElement)) throw new Error('Campo monetário não encontrado.');
	return { form, input, props: componentProps };
}

async function editInput(input: HTMLInputElement, value: string) {
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await tick();
}

describe('BrlAmountInput', () => {
	it('starts with a visible placeholder and an empty canonical field', async () => {
		const { form, input } = await renderAmount();

		expect(input.value).toBe('0,00');
		expect(input.type).toBe('text');
		expect(input.inputMode).toBe('numeric');
		expect(input.name).toBe('');
		expect(new FormData(form).getAll('valor')).toEqual(['']);
	});

	it('keeps the canonical value while typing from right to left', async () => {
		const { form, input } = await renderAmount();

		for (const digit of '170058') await editInput(input, `${input.value}${digit}`);

		expect(input.value).toBe('1.700,58');
		expect(new FormData(form).get('valor')).toBe('1700.58');
	});

	it('accepts canonical, localized and currency-formatted pastes', async () => {
		const { form, input } = await renderAmount();

		await editInput(input, 'R$ 1.700,58');

		expect(input.value).toBe('1.700,58');
		expect(new FormData(form).get('valor')).toBe('1700.58');
	});

	it('returns to an empty canonical value after the last digit is removed', async () => {
		const { form, input } = await renderAmount({ value: '0.01' });

		await editInput(input, input.value.slice(0, -1));

		expect(input.value).toBe('0,00');
		expect(new FormData(form).get('valor')).toBe('');
	});

	it('applies required validity to the visible field only', async () => {
		const { form, input } = await renderAmount({ required: true });

		expect(input.checkValidity()).toBe(false);
		expect(form.querySelector('input[type="hidden"]')?.getAttribute('required')).toBeNull();

		await editInput(input, '1');
		expect(input.checkValidity()).toBe(true);
	});

	it('keeps server validation semantics on the visible field', async () => {
		const { input } = await renderAmount({ invalid: 'true', describedBy: 'valor-errors' });

		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe('valor-errors');
		expect(document.querySelector('input[type="hidden"]')?.getAttribute('aria-invalid')).toBeNull();
	});

	it('reformats values when the form response changes the bound prop', async () => {
		const rendered = await renderAmount({ value: '' });
		rendered.props.value = '123.2';
		await tick();

		expect(rendered.input.value).toBe('123,20');
		expect(new FormData(rendered.form).get('valor')).toBe('123.20');
	});
});

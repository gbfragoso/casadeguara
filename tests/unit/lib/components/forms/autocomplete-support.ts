import { mount, tick, unmount, type ComponentProps } from 'svelte';
import { afterEach } from 'vitest';
import Autocomplete from '$lib/components/forms/Autocomplete.svelte';

export const options = [
	{ value: '7', label: 'Clício Fogaça' },
	{ value: '8', label: 'Clébio Medeiros Fragoso' },
	{ value: '9', label: 'Clício Fogaça' },
];
let mounted: ReturnType<typeof mount> | undefined;

afterEach(async () => {
	if (mounted) await unmount(mounted);
	mounted = undefined;
	document.body.replaceChildren();
});

export async function renderAutocomplete(props: Partial<ComponentProps<typeof Autocomplete>> = {}) {
	const form = document.createElement('form');
	const target = document.createElement('div');
	form.append(target);
	document.body.append(form);
	mounted = mount(Autocomplete, {
		target,
		props: { id: 'cadastro', name: 'contraparteId', options, ...props },
	});
	await tick();
	const input = form.querySelector('[role="combobox"]');
	if (!(input instanceof HTMLInputElement)) throw new Error('Campo de cadastro não encontrado.');
	return { form, input };
}

export async function typeQuery(input: HTMLInputElement, text: string) {
	input.focus();
	input.value = text;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await tick();
}

export async function pressKey(input: HTMLInputElement, key: string, isComposing = false) {
	const event = new KeyboardEvent('keydown', { key, isComposing, bubbles: true, cancelable: true });
	input.dispatchEvent(event);
	await tick();
	return event;
}

export function getOption(value: string) {
	const option = document.getElementById(`cadastro-option-${value}`);
	if (!(option instanceof HTMLButtonElement)) throw new Error(`Sugestão ${value} não encontrada.`);
	return option;
}

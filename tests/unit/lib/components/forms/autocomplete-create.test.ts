// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest';
import { pressKey, renderAutocomplete, typeQuery } from './autocomplete-support';

const speakers = [
	{ value: '4', label: 'Carmélia Amorim' },
	{ value: '5', label: 'Paulo Amorim' },
];

const createLabel = (text: string) => `Cadastrar «${text}»`;

const renderSpeakers = (onCreate = vi.fn(), onSelect = vi.fn()) =>
	renderAutocomplete({ options: speakers, onSelect, createOption: { label: createLabel, onCreate } });

const findCreateOption = () => document.getElementById('cadastro-create');

describe('Autocomplete option creation', () => {
	it('suggests a speaker typed without accents', async () => {
		const { input } = await renderSpeakers();

		await typeQuery(input, 'carmelia');

		const labels = [...document.querySelectorAll('[role="option"]')].map((option) => option.textContent?.trim());
		expect(labels).toContain('Carmélia Amorim');
	});

	it('reports the selected option', async () => {
		const onSelect = vi.fn();
		const { input } = await renderSpeakers(vi.fn(), onSelect);
		await typeQuery(input, 'paulo');

		document.getElementById('cadastro-option-5')?.click();

		expect(onSelect).toHaveBeenCalledWith({ value: '5', label: 'Paulo Amorim' });
	});

	it('offers to register a name that matches no option', async () => {
		const onCreate = vi.fn();
		const { input } = await renderSpeakers(onCreate);
		await typeQuery(input, ' Novo Nome ');

		const option = findCreateOption();
		option?.click();

		expect(option?.textContent?.trim()).toBe('Cadastrar «Novo Nome»');
		expect(onCreate).toHaveBeenCalledWith('Novo Nome');
	});

	it('registers the typed name from the keyboard', async () => {
		const onCreate = vi.fn();
		const { input } = await renderSpeakers(onCreate);
		await typeQuery(input, 'x');

		await pressKey(input, 'ArrowDown');
		await pressKey(input, 'Enter');

		expect(onCreate).toHaveBeenCalledWith('x');
	});

	it('does not offer to register a name that already exists without accents or case', async () => {
		const { input } = await renderSpeakers();

		await typeQuery(input, 'CARMELIA AMORIM');

		expect(findCreateOption()).toBeNull();
	});
});

// @vitest-environment happy-dom
import { tick, type ComponentProps } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import SpeakerField from '#lib/components/talks/SpeakerField.svelte';
import { renderComponent } from '../support/render-component.js';
import { findByLabel, pressKey, speakers, typeText } from './talk-fixtures';

type SpeakerProps = ComponentProps<typeof SpeakerField>;

const CARMELIA = { id: 4, nome: 'Carmélia Amorim', temFoto: false };

const renderSpeaker = async (props: Partial<SpeakerProps> = {}) => {
	const onSave = vi.fn<SpeakerProps['onSave']>(props.onSave ?? (() => Promise.resolve({ ok: true })));
	const target = await renderComponent(SpeakerField, {
		id: 'palestra-31-palestrante',
		speaker: CARMELIA,
		options: speakers,
		...props,
		onSave,
	});
	return { target, onSave };
};

const openSearch = async (target: HTMLElement, label = 'Editar palestrante: Carmélia Amorim') => {
	findByLabel(target, label, HTMLButtonElement).click();
	await tick();
	const input = target.querySelector('[role="combobox"]');
	if (!(input instanceof HTMLInputElement)) throw new Error('Busca de palestrante não encontrada.');
	return input;
};

describe('SpeakerField', () => {
	it('saves the selected speaker', async () => {
		const { target, onSave } = await renderSpeaker({ speaker: null });
		const input = await openSearch(target, 'Editar palestrante: a definir');
		await typeText(input, 'paulo');

		document.getElementById('palestra-31-palestrante-option-5')?.click();
		await tick();

		expect(onSave).toHaveBeenCalledWith({ campo: 'palestranteId', valor: '5' });
		expect(target.querySelector('button')?.textContent?.trim()).toBe('Paulo Amorim');
	});

	it('registers a new speaker from the typed name', async () => {
		const { target, onSave } = await renderSpeaker();
		const input = await openSearch(target);
		await typeText(input, 'Novo Nome');

		document.getElementById('palestra-31-palestrante-create')?.click();
		await tick();

		expect(onSave).toHaveBeenCalledWith({ campo: 'novoPalestrante', valor: 'Novo Nome' });
	});

	it('removes the speaker when the text is erased and confirmed', async () => {
		const { target, onSave } = await renderSpeaker();
		const input = await openSearch(target);
		await typeText(input, '');

		await pressKey(input, 'Enter');

		expect(onSave).toHaveBeenCalledWith({ campo: 'palestranteId', valor: '' });
	});

	it('cancels the search without saving when the focus leaves with a name typed', async () => {
		const { target, onSave } = await renderSpeaker();
		const input = await openSearch(target);
		await typeText(input, 'carm');

		input.blur();
		await tick();

		expect(onSave).not.toHaveBeenCalled();
		expect(target.querySelector('button')?.textContent?.trim()).toBe('Carmélia Amorim');
	});

	it('does not save when the current speaker is chosen again', async () => {
		const { target, onSave } = await renderSpeaker();
		const input = await openSearch(target);
		await typeText(input, 'carmelia');

		document.getElementById('palestra-31-palestrante-option-4')?.click();
		await tick();

		expect(onSave).not.toHaveBeenCalled();
	});

	it('cancels the search from the keyboard even after erasing the name', async () => {
		const { target, onSave } = await renderSpeaker();
		const input = await openSearch(target);
		await typeText(input, '');

		await pressKey(input, 'Escape');
		await pressKey(input, 'Escape');

		expect(onSave).not.toHaveBeenCalled();
		expect(target.querySelector('button')?.textContent?.trim()).toBe('Carmélia Amorim');
	});

	it('removes the speaker when the erased search loses focus', async () => {
		const { target, onSave } = await renderSpeaker();
		const input = await openSearch(target);
		await typeText(input, '');

		input.blur();
		await tick();

		expect(onSave).toHaveBeenCalledWith({ campo: 'palestranteId', valor: '' });
	});

	it('shows the speaker name read-only in the history of volunteers', async () => {
		const { target } = await renderSpeaker({ readonly: true });

		expect(target.querySelector('button')).toBeNull();
		expect(target.textContent).toContain('Carmélia Amorim');
	});

	it('restores the previous speaker and shows the reason when saving fails', async () => {
		const message = 'Já existe um palestrante com esse nome.';
		const onSave = vi.fn<SpeakerProps['onSave']>(() => Promise.resolve({ ok: false, message }));
		const { target } = await renderSpeaker({ onSave });
		const input = await openSearch(target);
		await typeText(input, 'Outro Nome');

		document.getElementById('palestra-31-palestrante-create')?.click();

		await vi.waitFor(() => expect(target.querySelector('[role="alert"]')?.textContent).toBe(message));
		expect(target.querySelector('button')?.textContent?.trim()).toBe('Carmélia Amorim');
	});

	it('shows the speaker photo as a circular thumbnail', async () => {
		const { target } = await renderSpeaker({ speaker: { ...CARMELIA, temFoto: true } });

		const photo = target.querySelector('img');

		expect(photo?.getAttribute('src')).toBe('/comunicacao/palestrantes/4/foto/miniatura');
		expect(photo?.getAttribute('alt')).toBe('Foto de Carmélia Amorim');
	});
});

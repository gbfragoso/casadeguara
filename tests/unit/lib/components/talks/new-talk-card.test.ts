// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import NewTalkCard from '#lib/components/talks/NewTalkCard.svelte';
import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { getElement, renderComponent } from '../support/render-component.js';
import { actionError, actionFailure } from '../../talks/action-results.js';
import { createRequestContext, typeText } from './talk-fixtures';

const MONDAY = '2026-03-09';
const TUESDAY = '2026-03-10';
const SUGGESTED_TIMES = { 1: '08:45', 2: null, 3: null, 4: null, 5: null, 6: '14:30', 7: null };

const renderNewTalk = async (result?: Parameters<typeof createRequestContext>[0]) => {
	const context = createRequestContext(result);
	const target = await renderComponent(NewTalkCard, {
		context,
		hoje: '2026-03-01',
		isAdmin: false,
		localPadrao: DEFAULT_TALK_LOCATION,
		horariosSugeridos: SUGGESTED_TIMES,
	});
	getElement(target, 'button', HTMLButtonElement).click();
	await tick();
	return { target, context };
};

const readInput = (target: HTMLElement, id: string) => getElement(target, `#${id}`, HTMLInputElement);

const submit = async (target: HTMLElement) => {
	getElement(target, 'form', HTMLFormElement).requestSubmit();
	await tick();
};

const readErrors = (target: HTMLElement, id: string) => target.querySelector(`#${id}-errors`)?.textContent?.trim();

describe('NewTalkCard', () => {
	it('suggests the time of the same weekday and the default location', async () => {
		const { target } = await renderNewTalk();

		await typeText(readInput(target, 'nova-palestra-data'), MONDAY);

		expect(readInput(target, 'nova-palestra-horario').value).toBe('08:45');
		expect(readInput(target, 'nova-palestra-local').value).toBe(DEFAULT_TALK_LOCATION);
	});

	it('keeps a time the user typed when the date changes', async () => {
		const { target } = await renderNewTalk();
		await typeText(readInput(target, 'nova-palestra-horario'), '19:30');

		await typeText(readInput(target, 'nova-palestra-data'), MONDAY);

		expect(readInput(target, 'nova-palestra-horario').value).toBe('19:30');
	});

	it('does not create a talk without a date and points to the field', async () => {
		const { target, context } = await renderNewTalk();

		await submit(target);

		expect(context.submit).not.toHaveBeenCalled();
		expect(readErrors(target, 'nova-palestra-data')).toBe('Informe a data.');
	});

	it('does not create a talk without a time and points to the field', async () => {
		const { target, context } = await renderNewTalk();
		await typeText(readInput(target, 'nova-palestra-data'), TUESDAY);

		await submit(target);

		expect(context.submit).not.toHaveBeenCalled();
		expect(readErrors(target, 'nova-palestra-horario')).toBe('Informe o horário.');
	});

	it('creates the talk, refreshes the board and returns to the button', async () => {
		const { target, context } = await renderNewTalk();
		await typeText(readInput(target, 'nova-palestra-data'), MONDAY);

		await submit(target);

		await vi.waitFor(() => expect(target.querySelector('form')).toBeNull());
		expect(context.submit).toHaveBeenCalledWith('?/criar', {
			data: MONDAY,
			horario: '08:45',
			local: DEFAULT_TALK_LOCATION,
		});
		expect(context.refresh).toHaveBeenCalledOnce();
		expect(document.activeElement?.textContent?.trim()).toBe('Nova palestra');
	});

	it('shows a field refused by the server next to it', async () => {
		const message = 'Somente a coordenação pode usar uma data anterior a hoje.';
		const { target } = await renderNewTalk(
			actionFailure(400, { codigo: 'data-passada', campo: 'data', mensagem: message }),
		);
		await typeText(readInput(target, 'nova-palestra-data'), MONDAY);

		await submit(target);

		await vi.waitFor(() => expect(readErrors(target, 'nova-palestra-data')).toBe(message));
	});

	it('shows an unexpected failure below the form', async () => {
		const { target } = await renderNewTalk(actionError());
		await typeText(readInput(target, 'nova-palestra-data'), MONDAY);

		await submit(target);

		await vi.waitFor(() =>
			expect(target.querySelector('[role="alert"]')?.textContent).toContain('Não foi possível criar a palestra.'),
		);
	});
});

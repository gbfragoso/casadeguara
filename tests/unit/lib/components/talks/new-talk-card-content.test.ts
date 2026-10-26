// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import { actionFailure } from '../../talks/action-results.js';
import { getElement } from '../support/render-component.js';
import { MONDAY, readErrors, readInput, renderNewTalk, submit } from './new-talk-card-support';
import { typeText } from './talk-fixtures';

const SPEAKER_ID = 'nova-palestra-palestrante';

const typeSpeaker = (target: HTMLElement, text: string) => typeText(readInput(target, SPEAKER_ID), text);

const clickOption = async (target: HTMLElement, id: string) => {
	getElement(target, `#${id}`, HTMLButtonElement).click();
	await tick();
};

const fillSchedule = (target: HTMLElement) => typeText(readInput(target, 'nova-palestra-data'), MONDAY);

describe('NewTalkCard content and speaker', () => {
	it('creates the talk with a title, an existing speaker and notes', async () => {
		const { target, context } = await renderNewTalk();
		await fillSchedule(target);
		await typeText(readInput(target, 'nova-palestra-titulo-palestra'), 'A prece');
		await typeSpeaker(target, 'paulo');
		await clickOption(target, `${SPEAKER_ID}-option-5`);
		await typeText(getElement(target, '#nova-palestra-observacoes', HTMLTextAreaElement), 'Cap. 20');

		await submit(target);

		expect(context.submit).toHaveBeenCalledWith(
			'?/criar',
			expect.objectContaining({
				titulo: 'A prece',
				palestranteId: '5',
				novoPalestrante: '',
				observacoes: 'Cap. 20',
			}),
		);
	});

	it('registers a new speaker typed in the form', async () => {
		const { target, context } = await renderNewTalk();
		await fillSchedule(target);
		await typeSpeaker(target, ' Novo Nome ');

		await clickOption(target, `${SPEAKER_ID}-create`);
		await submit(target);

		expect(target.textContent).toContain('«Novo Nome» entra no cadastro de palestrantes ao criar a palestra.');
		expect(context.submit).toHaveBeenCalledWith(
			'?/criar',
			expect.objectContaining({ palestranteId: '', novoPalestrante: 'Novo Nome' }),
		);
	});

	it('does not create a talk while the typed speaker is not confirmed', async () => {
		const { target, context } = await renderNewTalk();
		await fillSchedule(target);
		await typeSpeaker(target, 'Carm');

		await submit(target);

		expect(context.submit).not.toHaveBeenCalled();
		expect(readErrors(target, SPEAKER_ID)).toBe('Selecione um palestrante da lista ou cadastre um novo.');
	});

	it('shows a duplicate speaker name refused by the server on the speaker field', async () => {
		const message = 'Já existe um palestrante com esse nome.';
		const { target } = await renderNewTalk(
			actionFailure(400, { codigo: 'nome-duplicado', campo: 'novoPalestrante', mensagem: message }),
		);
		await fillSchedule(target);
		await typeSpeaker(target, 'Ana Amorim');
		await clickOption(target, `${SPEAKER_ID}-create`);

		await submit(target);

		await vi.waitFor(() => expect(readErrors(target, SPEAKER_ID)).toBe(message));
	});
});

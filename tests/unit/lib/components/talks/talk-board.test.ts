// @vitest-environment happy-dom
import { flushSync, tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '$app/forms';
import { actionError, actionFailure } from '../../talks/action-results.js';

import TalkBoard from '#lib/components/talks/TalkBoard.svelte';
import { renderComponent } from '../support/render-component.js';
import { buildTalk, createRequestContext, findByLabel, pressKey, speakers, typeText } from './talk-fixtures';

const talkA = buildTalk({ id: 31, titulo: 'A', data: '2026-03-02', horario: '08:45', versao: 3 });
const talkB = buildTalk({ id: 32, titulo: 'B', data: '2026-03-07', horario: '14:30', versao: 1 });
const talkC = buildTalk({ id: 33, titulo: 'C', data: '2026-03-09', horario: '08:45', versao: 2 });
const MOVE_A_DOWN = { origemId: '31', destinoId: '32', ids: ['31', '32'], versoes: ['3', '1'] };
const MOVE_FAILURE = 'Não foi possível trocar as datas. Nada foi alterado.';

const renderBoard = async (result?: ActionResult | Promise<ActionResult>, isAdmin = false) => {
	const context = createRequestContext(result);
	const target = await renderComponent(TalkBoard, {
		talks: [talkA, talkB, talkC],
		hoje: '2026-03-01',
		isAdmin,
		palestrantes: speakers,
		context,
	});
	return { target, context };
};

const readOrder = (target: HTMLElement) =>
	[...target.querySelectorAll('article')].map((card) => card.getAttribute('aria-label'));

const readAnnouncement = (target: HTMLElement) => target.querySelector('p[role="status"]')?.textContent;

const clickMove = async (target: HTMLElement, label: string) => {
	findByLabel(target, label, HTMLButtonElement).click();
	await tick();
};

describe('TalkBoard', () => {
	it('sends the swapped range when a talk is moved down', async () => {
		const { target, context } = await renderBoard();

		await clickMove(target, 'Mover para baixo: A');

		await vi.waitFor(() => expect(context.refresh).toHaveBeenCalledOnce());
		expect(context.submit).toHaveBeenCalledWith('?/mover', MOVE_A_DOWN);
	});

	it('keeps the focus on the moved card and announces its new date', async () => {
		const { target } = await renderBoard();

		await clickMove(target, 'Mover para baixo: A');

		await vi.waitFor(() => expect(readAnnouncement(target)).toBe('«A» agora em Sábado, 07/03/2026 · 14:30'));
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Mover para baixo: A');
	});

	it('focuses the moved card when its move command reaches the end of the board', async () => {
		const { target } = await renderBoard();

		await clickMove(target, 'Mover para cima: B');

		await vi.waitFor(() => expect(document.activeElement?.tagName).toBe('ARTICLE'));
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Segunda-feira, 02/03/2026 · 08:45 · B');
	});

	it('shows the new order and blocks other moves while the swap is saved', async () => {
		const { target } = await renderBoard(new Promise(() => undefined));

		await clickMove(target, 'Mover para baixo: A');

		expect(readOrder(target)).toEqual([
			'Segunda-feira, 02/03/2026 · 08:45 · B',
			'Sábado, 07/03/2026 · 14:30 · A',
			'Segunda-feira, 09/03/2026 · 08:45 · C',
		]);
		expect(findByLabel(target, 'Mover para baixo: C', HTMLButtonElement).disabled).toBe(true);
		expect(findByLabel(target, 'Mover para cima: C', HTMLButtonElement).disabled).toBe(true);
	});

	it('restores the previous order and dates and shows the error when the swap fails', async () => {
		const { target } = await renderBoard(actionError());

		await clickMove(target, 'Mover para baixo: A');

		await vi.waitFor(() => expect(target.querySelector('[role="alert"]')?.textContent).toBe(MOVE_FAILURE));
		expect(readOrder(target)).toEqual([
			'Segunda-feira, 02/03/2026 · 08:45 · A',
			'Sábado, 07/03/2026 · 14:30 · B',
			'Segunda-feira, 09/03/2026 · 08:45 · C',
		]);
	});

	it('leaves the conflict message to the board notice after refreshing', async () => {
		const mensagem = 'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.';
		const { target, context } = await renderBoard(actionFailure(409, { codigo: 'conflito', mensagem }));

		await clickMove(target, 'Mover para baixo: A');

		await vi.waitFor(() => expect(context.onNotice).toHaveBeenCalledWith(mensagem));
		expect(context.refresh).toHaveBeenCalledOnce();
		expect(target.querySelector('[role="alert"]')).toBeNull();
	});

	it('sends the swap when a dragged talk is dropped on another position', async () => {
		const { target, context } = await renderBoard();
		const zone = target.querySelector('ol');

		zone?.dispatchEvent(
			new CustomEvent('finalize', { detail: { items: [talkB, talkA, talkC], info: { id: talkA.id } } }),
		);
		flushSync();

		await vi.waitFor(() => expect(context.submit).toHaveBeenCalledWith('?/mover', MOVE_A_DOWN));
	});

	it('sends nothing when a dragged talk is dropped back in place', async () => {
		const { target, context } = await renderBoard();
		const zone = target.querySelector('ol');

		zone?.dispatchEvent(
			new CustomEvent('consider', { detail: { items: [talkB, talkA, talkC], info: { id: talkA.id } } }),
		);
		zone?.dispatchEvent(
			new CustomEvent('finalize', { detail: { items: [talkA, talkB, talkC], info: { id: talkA.id } } }),
		);
		flushSync();

		expect(context.submit).not.toHaveBeenCalled();
		expect(readOrder(target)[0]).toBe('Segunda-feira, 02/03/2026 · 08:45 · A');
	});

	it('saves a field edited on a card with its loaded version', async () => {
		const { target, context } = await renderBoard();
		findByLabel(target, 'Editar título: C', HTMLButtonElement).click();
		await tick();
		const title = findByLabel(target, 'Título', HTMLInputElement);
		await typeText(title, 'O passe');

		await pressKey(title, 'Enter');

		expect(context.submit).toHaveBeenCalledWith('?/atualizar', {
			id: '33',
			versao: '2',
			campo: 'titulo',
			valor: 'O passe',
		});
	});

	it('lets the coordinator delete a talk', async () => {
		const { target, context } = await renderBoard(undefined, true);

		findByLabel(target, 'Confirmar exclusão da palestra B', HTMLButtonElement).click();
		await tick();

		expect(context.submit).toHaveBeenCalledWith('?/excluir', { id: '32' });
	});
});

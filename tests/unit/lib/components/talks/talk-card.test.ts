// @vitest-environment happy-dom
import { tick, type ComponentProps } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import TalkCard from '#lib/components/talks/TalkCard.svelte';
import { getElement, renderComponent } from '../support/render-component.js';
import { buildTalk, findByLabel, pressKey, speakers, typeText } from './talk-fixtures';

type CardProps = ComponentProps<typeof TalkCard>;

const renderCard = (props: Partial<CardProps> = {}) => {
	const onUpdate = vi.fn<CardProps['onUpdate']>(() => Promise.resolve({ ok: true }));
	return renderComponent(TalkCard, {
		talk: buildTalk(),
		hoje: '2026-03-01',
		isAdmin: false,
		palestrantes: speakers,
		onUpdate,
		...props,
	});
};

const moveControls = { canMoveUp: true, canMoveDown: true, disabled: false, onMove: vi.fn() };

const readLabels = (target: HTMLElement) =>
	[...target.querySelectorAll('button')].map((button) => button.getAttribute('aria-label'));

describe('TalkCard', () => {
	it('names the card by its full schedule and title', async () => {
		const target = await renderCard();

		expect(target.querySelector('article')?.getAttribute('aria-label')).toBe(
			'Segunda-feira, 02/03/2026 · 08:45 · A prece',
		);
		expect(readLabels(target)).toEqual(
			expect.arrayContaining(['Editar data: Segunda-feira, 02/03/2026', 'Editar horário: 08:45']),
		);
	});

	it('shows empty fields as "a definir"', async () => {
		const talk = buildTalk({ titulo: null, palestrante: null, local: null, observacoes: null });

		const target = await renderCard({ talk });

		expect(readLabels(target)).toEqual(
			expect.arrayContaining([
				'Editar título: Título a definir',
				'Editar palestrante: a definir',
				'Editar local: a definir',
				'Editar observações: a definir',
			]),
		);
	});

	it('keeps the line breaks of the notes', async () => {
		const talk = buildTalk({ observacoes: 'Livro: Jesus e Atualidade,\nCap. 20' });

		const target = await renderCard({ talk });

		const notes = findByLabel(target, 'Editar observações: Livro: Jesus e Atualidade,\nCap. 20', HTMLButtonElement);
		expect(notes.textContent?.trim()).toBe('Livro: Jesus e Atualidade,\nCap. 20');
	});

	it('names the move commands with the talk title', async () => {
		const target = await renderCard({ move: moveControls });

		expect(readLabels(target)).toEqual(
			expect.arrayContaining(['Mover para cima: A prece', 'Mover para baixo: A prece']),
		);
	});

	it('names the move commands with the schedule when the title is missing', async () => {
		const target = await renderCard({ talk: buildTalk({ titulo: null }), move: moveControls });

		expect(readLabels(target)).toContain('Mover para cima: Segunda-feira, 02/03/2026 · 08:45');
	});

	it('starts the volunteer date picker at today', async () => {
		const target = await renderCard();
		findByLabel(target, 'Editar data: Segunda-feira, 02/03/2026', HTMLButtonElement).click();
		await tick();

		expect(findByLabel(target, 'Data', HTMLInputElement).min).toBe('2026-03-01');
	});

	it('lets the coordinator pick a past date', async () => {
		const target = await renderCard({ isAdmin: true });
		findByLabel(target, 'Editar data: Segunda-feira, 02/03/2026', HTMLButtonElement).click();
		await tick();

		expect(findByLabel(target, 'Data', HTMLInputElement).min).toBe('');
	});

	it('sends the speaker chosen on the card', async () => {
		const onUpdate = vi.fn<CardProps['onUpdate']>(() => Promise.resolve({ ok: true }));
		const target = await renderCard({ onUpdate });
		findByLabel(target, 'Editar palestrante: Carmélia Amorim', HTMLButtonElement).click();
		await tick();
		await typeText(getElement(target, '[role="combobox"]', HTMLInputElement), 'paulo');

		document.getElementById('palestra-31-palestrante-option-5')?.click();

		expect(onUpdate).toHaveBeenCalledWith('palestranteId', '5');
	});

	it('hides the delete command from volunteers', async () => {
		const target = await renderCard({ move: moveControls });

		expect(readLabels(target).some((label) => label?.startsWith('Excluir'))).toBe(false);
	});

	it('deletes the talk after the coordinator confirms', async () => {
		const onDelete = vi.fn(() => Promise.resolve());
		const target = await renderCard({ isAdmin: true, onDelete });

		findByLabel(target, 'Confirmar exclusão da palestra A prece', HTMLButtonElement).click();
		await tick();

		expect(onDelete).toHaveBeenCalledOnce();
	});

	it('shows a past talk read-only to volunteers', async () => {
		const target = await renderCard({ readonly: true });

		expect(target.querySelector('button')).toBeNull();
		expect(target.textContent).toContain('Carmélia Amorim');
	});

	it('rejects a title above the limit without sending it', async () => {
		const onUpdate = vi.fn<CardProps['onUpdate']>(() => Promise.resolve({ ok: true }));
		const target = await renderCard({ onUpdate });
		findByLabel(target, 'Editar título: A prece', HTMLButtonElement).click();
		await tick();
		const title = findByLabel(target, 'Título', HTMLInputElement);
		await typeText(title, 'x'.repeat(71));

		await pressKey(title, 'Enter');

		expect(onUpdate).not.toHaveBeenCalled();
		expect(target.querySelector('[role="alert"]')?.textContent).toBe('O título deve ter até 70 caracteres.');
	});

	it('sends a changed field to the board', async () => {
		const onUpdate = vi.fn<CardProps['onUpdate']>(() => Promise.resolve({ ok: true }));
		const target = await renderCard({ onUpdate });
		findByLabel(target, 'Editar horário: 08:45', HTMLButtonElement).click();
		await tick();
		const time = findByLabel(target, 'Horário', HTMLInputElement);
		await typeText(time, '09:00');

		await pressKey(time, 'Enter');

		expect(onUpdate).toHaveBeenCalledWith('horario', '09:00');
	});
});

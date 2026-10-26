// @vitest-environment happy-dom
import { tick, type ComponentProps } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import TalkCard from '#lib/components/talks/TalkCard.svelte';
import { DEFAULT_MEETING_ACTIVITIES } from '#lib/talks/defaults.js';
import { renderComponent } from '../support/render-component.js';
import { buildTalk, findByLabel, speakers, typeText } from './talk-fixtures';

type CardProps = ComponentProps<typeof TalkCard>;

const ACTIVITIES_TEXT = DEFAULT_MEETING_ACTIVITIES.join('\n');
const NOTES_HELP = 'Aparece na arte de divulgação, abaixo do título.';

const renderCard = (props: Partial<CardProps> = {}) =>
	renderComponent(TalkCard, {
		talk: buildTalk(),
		hoje: '2026-03-01',
		isAdmin: false,
		palestrantes: speakers,
		onArtStale: vi.fn(() => Promise.resolve()),
		onUpdate: vi.fn<CardProps['onUpdate']>(() => Promise.resolve({ ok: true })),
		...props,
	});

const openActivities = async (target: HTMLElement) => {
	findByLabel(target, `Editar reunião com: ${ACTIVITIES_TEXT}`, HTMLButtonElement).click();
	await tick();
	return findByLabel(target, 'Reunião com', HTMLTextAreaElement);
};

describe('TU-28 TalkCard meeting activities', () => {
	it('shows the meeting activities one per line', async () => {
		const target = await renderCard();

		const activities = findByLabel(target, `Editar reunião com: ${ACTIVITIES_TEXT}`, HTMLButtonElement);

		expect(activities.textContent?.trim().split('\n')).toEqual(DEFAULT_MEETING_ACTIVITIES);
	});

	it('edits the meeting activities as text with one activity per line', async () => {
		const target = await renderCard();

		const editor = await openActivities(target);

		expect(editor.value).toBe(ACTIVITIES_TEXT);
		expect(document.getElementById(editor.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
			'Uma atividade por linha',
		);
	});

	it('sends the edited meeting activities to the board', async () => {
		const onUpdate = vi.fn<CardProps['onUpdate']>(() => Promise.resolve({ ok: true }));
		const target = await renderCard({ onUpdate });
		const editor = await openActivities(target);
		await typeText(editor, 'Palestra doutrinária\n\n  Passes e água fluidificada  ');

		editor.blur();
		await tick();

		expect(onUpdate).toHaveBeenCalledWith('reuniaoCom', 'Palestra doutrinária\n\n  Passes e água fluidificada  ');
	});

	it('rejects more than five meeting activities without sending them', async () => {
		const onUpdate = vi.fn<CardProps['onUpdate']>(() => Promise.resolve({ ok: true }));
		const target = await renderCard({ onUpdate });
		const editor = await openActivities(target);
		await typeText(editor, [...DEFAULT_MEETING_ACTIVITIES, 'Evangelização infantil'].join('\n'));

		editor.blur();
		await tick();

		expect(onUpdate).not.toHaveBeenCalled();
		expect(target.querySelector('[role="alert"]')?.textContent).toBe('Informe até 5 atividades, uma por linha.');
	});

	it('shows the meeting activities read-only in the history', async () => {
		const target = await renderCard({ readonly: true });

		expect(target.querySelector('button[aria-label^="Editar"]')).toBeNull();
		expect(target.textContent).toContain('Passes e água fluidificada');
	});

	it('tells that the notes appear in the publicity art', async () => {
		const target = await renderCard();

		const notes = findByLabel(target, 'Editar observações: a definir', HTMLButtonElement);

		expect(document.getElementById(notes.getAttribute('aria-describedby') ?? '')?.textContent).toBe(NOTES_HELP);
	});
});

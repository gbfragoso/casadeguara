// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import TalkCard from '#lib/components/talks/TalkCard.svelte';
import { TALK_LOCATION_MAX_LENGTH } from '#lib/validation/comunicacao/palestras.js';
import { renderComponent } from '../support/render-component.js';
import { createCardProps } from './talk-card-support.svelte.js';
import { buildTalk, findByLabel } from './talk-fixtures';

const ART_ACTION = 'Gerar arte para redes sociais: A prece';

const findDetails = (target: HTMLElement) => {
	const details = target.querySelector('details');
	if (!details) throw new Error('Seção de local e reunião com não encontrada');
	return details;
};

const readSummary = (target: HTMLElement) => findDetails(target).querySelector('summary')?.textContent?.trim();

describe('TalkCard location and meeting activities section', () => {
	it('keeps the location and meeting activities collapsed by default', async () => {
		const target = await renderComponent(TalkCard, createCardProps());

		const details = findDetails(target);

		expect(details.open).toBe(false);
		expect(readSummary(target)).toBe('Local e reunião com · padrão');
	});

	it('marks the section as altered when the location differs from the default', async () => {
		const talk = buildTalk({ local: 'Auditório da praça' });

		const target = await renderComponent(TalkCard, createCardProps({ talk }));

		expect(readSummary(target)).toBe('Local e reunião com · alterado');
	});

	it('marks the section as altered when the meeting activities differ from the default', async () => {
		const talk = buildTalk({ reuniaoCom: ['Palestra doutrinária'] });

		const target = await renderComponent(TalkCard, createCardProps({ talk }));

		expect(readSummary(target)).toBe('Local e reunião com · alterado');
	});

	it('opens the section when the art is blocked by an oversized location', async () => {
		const talk = buildTalk({ local: 'R'.repeat(TALK_LOCATION_MAX_LENGTH + 1) });
		const target = await renderComponent(TalkCard, createCardProps({ talk }));

		findByLabel(target, ART_ACTION, HTMLButtonElement).click();
		await tick();

		expect(findDetails(target).open).toBe(true);
	});

	it('keeps the section closed when the art is blocked by a missing title', async () => {
		const talk = buildTalk({ titulo: null });
		const target = await renderComponent(TalkCard, createCardProps({ talk }));

		findByLabel(
			target,
			'Gerar arte para redes sociais: Segunda-feira, 02/03/2026 · 08:45',
			HTMLButtonElement,
		).click();
		await tick();

		expect(findDetails(target).open).toBe(false);
	});
});

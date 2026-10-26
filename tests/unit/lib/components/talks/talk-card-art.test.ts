// @vitest-environment happy-dom
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import TalkCard from '#lib/components/talks/TalkCard.svelte';
import { renderComponent } from '../support/render-component.js';
import { createCardProps } from './talk-card-support.svelte.js';
import { buildTalk, findByLabel } from './talk-fixtures';

const UNTITLED_ART_ACTION = 'Gerar arte para redes sociais: Segunda-feira, 02/03/2026 · 08:45';
const MISSING_TITLE_MESSAGE = 'Para gerar a arte, defina o título da palestra.';

const readAlert = (target: HTMLElement) => target.querySelector('[role="alert"]')?.textContent?.trim();

describe('TU-27 TalkCard art readiness', () => {
	it('opens the art dialog of a ready talk from the card action', async () => {
		const target = await renderComponent(TalkCard, createCardProps());

		const action = findByLabel(target, 'Gerar arte para redes sociais: A prece', HTMLButtonElement);

		expect(action.getAttribute('popovertarget')).toBe('palestra-31-arte');
		expect(document.getElementById('palestra-31-arte')?.getAttribute('role')).toBe('dialog');
	});

	it('shows the readiness message in the card instead of opening the dialog', async () => {
		const target = await renderComponent(TalkCard, createCardProps({ talk: buildTalk({ titulo: null }) }));
		const action = findByLabel(target, UNTITLED_ART_ACTION, HTMLButtonElement);

		action.click();
		await tick();

		expect(readAlert(target)).toBe(MISSING_TITLE_MESSAGE);
		expect(action.hasAttribute('popovertarget')).toBe(false);
		expect(target.querySelector('[role="dialog"][id$="-arte"]')).toBeNull();
	});

	it('waits for the action before showing the readiness message', async () => {
		const target = await renderComponent(TalkCard, createCardProps({ talk: buildTalk({ titulo: null }) }));

		expect(readAlert(target)).toBeUndefined();
	});

	it('removes the readiness message once the title is defined', async () => {
		const props = createCardProps({ talk: buildTalk({ titulo: null }) });
		const target = await renderComponent(TalkCard, props);
		findByLabel(target, UNTITLED_ART_ACTION, HTMLButtonElement).click();
		await tick();

		props.talk = buildTalk({ titulo: 'A prece', versao: 4 });
		await tick();

		expect(readAlert(target)).toBeUndefined();
	});

	it('asks to shorten a legacy note that does not fit the art', async () => {
		const talk = buildTalk({ observacoes: 'x'.repeat(120) });
		const target = await renderComponent(TalkCard, createCardProps({ talk }));

		findByLabel(target, 'Gerar arte para redes sociais: A prece', HTMLButtonElement).click();
		await tick();

		expect(readAlert(target)).toBe(
			'As observações estão maiores do que cabe na arte. Encurte-as no card para gerar a arte.',
		);
	});
});

import { tick } from 'svelte';

import NewTalkCard from '#lib/components/talks/NewTalkCard.svelte';
import { DEFAULT_MEETING_ACTIVITIES, DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { getElement, renderComponent } from '../support/render-component.js';
import { createRequestContext, speakers } from './talk-fixtures';

export const MONDAY = '2026-03-09';
const SUGGESTED_TIMES = { 1: '08:45', 2: null, 3: null, 4: null, 5: null, 6: '14:30', 7: null };

export const renderNewTalk = async (result?: Parameters<typeof createRequestContext>[0]) => {
	const context = createRequestContext(result);
	const target = await renderComponent(NewTalkCard, {
		context,
		hoje: '2026-03-01',
		isAdmin: false,
		localPadrao: DEFAULT_TALK_LOCATION,
		reuniaoComPadrao: DEFAULT_MEETING_ACTIVITIES,
		horariosSugeridos: SUGGESTED_TIMES,
		palestrantes: speakers,
	});
	getElement(target, 'button', HTMLButtonElement).click();
	await tick();
	return { target, context };
};

export const readInput = (target: HTMLElement, id: string) => getElement(target, `#${id}`, HTMLInputElement);

export const readMeetingActivities = (target: HTMLElement) =>
	getElement(target, '#nova-palestra-reuniao-com', HTMLTextAreaElement);

export const submit = async (target: HTMLElement) => {
	getElement(target, 'form', HTMLFormElement).requestSubmit();
	await tick();
};

export const readErrors = (target: HTMLElement, id: string) =>
	target.querySelector(`#${id}-errors`)?.textContent?.trim();

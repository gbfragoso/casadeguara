import { flushSync, tick } from 'svelte';
import { vi } from 'vitest';
import type { ActionResult } from '$app/forms';
import type { TalkCard } from '#lib/talks/types.js';
import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { actionSuccess } from '../../talks/action-results.js';

export const buildTalk = (overrides: Partial<TalkCard> = {}): TalkCard => ({
	id: 31,
	data: '2026-03-02',
	horario: '08:45',
	titulo: 'A prece',
	observacoes: null,
	local: DEFAULT_TALK_LOCATION,
	palestrante: { id: 4, nome: 'Carmélia Amorim', temFoto: false },
	versao: 3,
	...overrides,
});

export const speakers = [
	{ id: 4, nome: 'Carmélia Amorim' },
	{ id: 5, nome: 'Paulo Amorim' },
];

export const createRequestContext = (result: ActionResult | Promise<ActionResult> = actionSuccess()) => ({
	submit: vi.fn(() => Promise.resolve(result)),
	refresh: vi.fn(() => Promise.resolve()),
	onNotice: vi.fn(),
});

export const findByLabel = <Element extends HTMLElement>(
	container: ParentNode,
	label: string,
	type: new () => Element,
) => {
	const element = container.querySelector(`[aria-label="${label}"]`);
	if (!(element instanceof type)) throw new Error(`Elemento não encontrado: ${label}`);
	return element;
};

export async function typeText(control: HTMLInputElement | HTMLTextAreaElement, text: string) {
	control.value = text;
	control.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
	await tick();
}

export async function pressKey(control: HTMLElement, key: string) {
	control.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
	await tick();
}

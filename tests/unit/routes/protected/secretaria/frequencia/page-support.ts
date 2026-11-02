import { tick } from 'svelte';
import { vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/frequencia/+page.svelte';
import { getElement, renderComponent } from '../../../../lib/components/support/render-component.js';

export const NOVEMBER_REQUEST = { titulo: 'Lista de presença', dataInicio: '2026-11-01', dataFim: '2026-11-30' };

export const pdfResponse = () => new Response(new Blob(['%PDF'], { type: 'application/pdf' }));

export const stubFetch = (respond: () => Promise<Response>) => {
	const fetcher = vi.fn<typeof fetch>(respond);
	vi.stubGlobal('fetch', fetcher);
	return fetcher;
};

export const renderPage = () => renderComponent(Page, {});

export const typeInto = async (target: HTMLElement, name: string, value: string) => {
	const input = getElement(target, `[name="${name}"]`, HTMLInputElement);
	input.value = value;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	await tick();
};

export const toggleWeekday = async (target: HTMLElement, value: string) => {
	getElement(target, `input[name="dias"][value="${value}"]`, HTMLInputElement).click();
	await tick();
};

export const submitForm = async (target: HTMLElement) => {
	const button = [...target.querySelectorAll('button')].find(
		(control) => control.textContent?.trim() === 'Gerar PDF',
	);
	if (!button) throw new Error('Botão "Gerar PDF" não encontrado.');
	button.click();
	await tick();
};

export const fillNovemberRequest = async (target: HTMLElement) => {
	for (const [name, value] of Object.entries(NOVEMBER_REQUEST)) await typeInto(target, name, value);
};

export const generateNovemberPdf = async () => {
	const target = await renderPage();
	await fillNovemberRequest(target);
	await submitForm(target);
	return target;
};

export const readNotice = (target: HTMLElement, role: 'status' | 'alert') =>
	target.querySelector(`[role="${role}"]`)?.textContent?.trim();

export const queryLink = (target: HTMLElement, text: string) =>
	[...target.querySelectorAll('a')].find((control) => control.textContent?.trim() === text);

export const findLink = (target: HTMLElement, text: string) => {
	const link = queryLink(target, text);
	if (!link) throw new Error(`Link não encontrado: ${text}`);
	return link;
};

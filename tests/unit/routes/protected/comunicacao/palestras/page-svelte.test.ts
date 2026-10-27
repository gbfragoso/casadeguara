// @vitest-environment happy-dom
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

const CONFLICT_MESSAGE = 'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.';
const boundary = vi.hoisted(() => ({ refreshAll: vi.fn(() => Promise.resolve()), deserialize: vi.fn() }));
vi.mock('$app/navigation', () => ({ refreshAll: boundary.refreshAll }));
vi.mock('$app/forms', () => ({ deserialize: boundary.deserialize }));

import Page from '../../../../../../src/routes/(protected)/comunicacao/palestras/+page.svelte';
import { DEFAULT_MEETING_ACTIVITIES, DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { getElement, renderComponent } from '../../../../lib/components/support/render-component.js';
import { buildTalk, findByLabel, speakers, typeText } from '../../../../lib/components/talks/talk-fixtures.js';

const SUGGESTED_TIMES = { 1: '08:45', 2: null, 3: null, 4: null, 5: null, 6: '14:30', 7: null };
const BOARD = {
	hoje: '2026-03-01',
	horariosSugeridos: SUGGESTED_TIMES,
	palestrantes: speakers,
	localPadrao: DEFAULT_TALK_LOCATION,
	reuniaoComPadrao: DEFAULT_MEETING_ACTIVITIES,
	isAdmin: false,
};
const talks = [buildTalk({ id: 31, titulo: 'A' }), buildTalk({ id: 32, titulo: 'B', data: '2026-03-07' })];

afterEach(() => {
	vi.unstubAllGlobals();
	boundary.refreshAll.mockClear();
	boundary.deserialize.mockReset();
});

const renderAgenda = (palestras = talks) => renderComponent(Page, { data: { ...BOARD, visao: 'agenda', palestras } });

const renderHistory = () =>
	renderComponent(Page, { data: { ...BOARD, visao: 'historico', palestras: talks, pagina: 1, temProxima: false } });

const readCurrentView = (target: HTMLElement) =>
	target.querySelector('nav[aria-label="Visão das palestras"] a[aria-current="page"]')?.textContent?.trim();

const readButtons = (target: HTMLElement) =>
	[...target.querySelectorAll('button')].map((button) => button.textContent?.trim());

describe('talk board page', () => {
	it('opens under the module breadcrumb', async () => {
		const target = await renderAgenda();

		const breadcrumb = [...target.querySelectorAll('header nav a')].map((link) => link.getAttribute('href'));

		expect(target.querySelector('h1')?.textContent?.trim()).toBe('Palestras');
		expect(breadcrumb).toEqual(['/comunicacao', '/comunicacao/palestras']);
	});

	it('shows the agenda with the new talk command', async () => {
		const target = await renderAgenda();

		expect(readCurrentView(target)).toBe('Agenda');
		expect(target.querySelector('ol[aria-label="Agenda de palestras"]')?.children).toHaveLength(2);
		expect(readButtons(target)).toContain('Nova palestra');
	});

	it('invites the volunteer to create a talk when the agenda is empty', async () => {
		const target = await renderAgenda([]);

		expect(target.querySelector('[role="status"]')?.textContent).toContain('Use “Nova palestra”');
		expect(readButtons(target)).toContain('Nova palestra');
	});

	it('opens the new talk card with the default location and the weekday time', async () => {
		const target = await renderAgenda();
		[...target.querySelectorAll('button')]
			.find((button) => button.textContent?.trim() === 'Nova palestra')
			?.click();
		await tick();
		const date = getElement(target, '#nova-palestra-data', HTMLInputElement);

		await typeText(date, '2026-03-09');

		expect(getElement(target, '#nova-palestra-horario', HTMLInputElement).value).toBe('08:45');
		expect(getElement(target, '#nova-palestra-local', HTMLInputElement).value).toBe(DEFAULT_TALK_LOCATION);
	});

	it('lets the coordinator edit the history', async () => {
		const target = await renderComponent(Page, {
			data: { ...BOARD, isAdmin: true, visao: 'historico', palestras: talks, pagina: 1, temProxima: false },
		});

		expect(target.querySelector('button[aria-label="Editar título: A"]')).not.toBeNull();
	});

	it('switches to the read-only history', async () => {
		const target = await renderHistory();

		expect(readCurrentView(target)).toBe('Histórico');
		expect(target.querySelector('ol[aria-label="Histórico de palestras"]')?.children).toHaveLength(2);
		expect(readButtons(target)).not.toContain('Nova palestra');
	});

	it.each([
		['agenda', renderAgenda],
		['history', renderHistory],
	])('TU-36 offers the monthly program in the %s', async (_view, render) => {
		const target = await render();

		expect(readButtons(target)).toContain('Programação do mês');
	});

	it('refreshes the board and explains a conflict until the notice is closed', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response(''))),
		);
		boundary.deserialize.mockReturnValue({
			type: 'failure',
			status: 409,
			data: { codigo: 'conflito', mensagem: CONFLICT_MESSAGE },
		});
		const target = await renderAgenda();
		findByLabel(target, 'Mover para baixo: A', HTMLButtonElement).click();

		await vi.waitFor(() =>
			expect(target.querySelector('[role="alert"]')?.textContent?.trim()).toBe(CONFLICT_MESSAGE),
		);
		findByLabel(target, 'Fechar aviso', HTMLButtonElement).click();
		await tick();

		expect(boundary.refreshAll).toHaveBeenCalledOnce();
		expect(target.querySelector('[role="alert"]')).toBeNull();
	});
});

// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { readNotice, renderPage, stubFetch, submitForm, toggleWeekday, typeInto } from './page-support';

const TITLE_MESSAGE = 'Informe o título da lista (até 60 caracteres).';
const PERIOD_MESSAGE = 'Informe um período válido.';

const readDescribedMessage = (target: HTMLElement, selector: string) => {
	const id = target.querySelector(selector)?.getAttribute('aria-describedby');
	return target.querySelector(`[id="${id}"]`)?.textContent?.trim();
};

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('TU-26 page validates the request before fetching', () => {
	it('shows the title and period messages on their fields without fetching', async () => {
		const fetcher = stubFetch(() => new Promise(() => undefined));
		const target = await renderPage();

		await submitForm(target);

		expect([readDescribedMessage(target, '#titulo'), readDescribedMessage(target, '#dataFim')]).toEqual([
			TITLE_MESSAGE,
			PERIOD_MESSAGE,
		]);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('focuses the first invalid field', async () => {
		stubFetch(() => new Promise(() => undefined));
		const target = await renderPage();
		await typeInto(target, 'titulo', 'Lista');

		await submitForm(target);

		expect(document.activeElement?.id).toBe('dataFim');
	});

	it('shows the date limit on the weekdays group', async () => {
		const fetcher = stubFetch(() => new Promise(() => undefined));
		const target = await renderPage();
		await typeInto(target, 'titulo', 'Lista');
		await typeInto(target, 'dataInicio', '2026-11-01');
		await typeInto(target, 'dataFim', '2026-12-31');

		await submitForm(target);

		expect(readDescribedMessage(target, 'fieldset')).toBe(
			'O período gera 27 datas; o limite é 15 por lista. Reduza o período ou os dias da semana.',
		);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('focuses the first weekday when no weekday is selected', async () => {
		stubFetch(() => new Promise(() => undefined));
		const target = await renderPage();
		await typeInto(target, 'titulo', 'Lista');
		await typeInto(target, 'dataInicio', '2026-11-01');
		await typeInto(target, 'dataFim', '2026-11-30');
		for (const weekday of ['1', '2', '4']) await toggleWeekday(target, weekday);

		await submitForm(target);

		expect(document.activeElement?.getAttribute('value')).toBe('1');
	});
});

describe('TU-30 page renders only the PDF form', () => {
	it('renders no table and no registration link', async () => {
		const target = await renderPage();

		expect(target.querySelector('table')).toBeNull();
		expect(target.querySelector('a[href$="/registro"]')).toBeNull();
		expect(readNotice(target, 'status')).toBeUndefined();
	});
});

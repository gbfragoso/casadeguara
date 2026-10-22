import { render } from 'svelte/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/aniversariantes/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

describe('birthday list page', () => {
	it('renders the birthday month in Portuguese', () => {
		const { body } = render(Page, {
			props: {
				form: {
					mes: '01',
					leitores: [
						{ nome: 'MARIA', aniversario: new Date('2026-01-15T00:00:00.000Z'), desencarnado: false },
					],
				},
			},
		});
		const document = parseRenderedBody(body);
		const heading = document.querySelector('#printable-content h2');

		expect(heading?.textContent).toContain('Aniversariantes do mês janeiro');
		expect(heading?.textContent).not.toContain('January');
	});

	it('marks deceased readers in memoriam', () => {
		const { body } = render(Page, {
			props: {
				form: {
					mes: '01',
					leitores: [
						{ nome: 'MARIA', aniversario: new Date('2026-01-15T00:00:00.000Z'), desencarnado: true },
					],
				},
			},
		});
		const document = parseRenderedBody(body);
		const readerRow = document.querySelector('#printable-content tbody tr');

		expect(readerRow?.textContent).toContain('MARIA (IN MEMORIAM)');
	});

	it('tells that no worker has a birthday in the searched month', () => {
		const { body } = render(Page, { props: { form: { mes: '02', leitores: [] } } });
		const document = parseRenderedBody(body);

		expect(document.querySelector('#printable-content')).toBeNull();
		expect(document.querySelector('[role="status"]')?.textContent).toBe(
			'Nenhum aniversariante encontrado em fevereiro.',
		);
	});

	it('keeps the searched month selected after generating the list', () => {
		const { body } = render(Page, { props: { form: { mes: '07', leitores: [] } } });
		const document = parseRenderedBody(body);

		expect(document.querySelector('select[name="mes"] option[selected]')?.getAttribute('value')).toBe('07');
	});

	describe('before a list is generated', () => {
		afterEach(() => vi.useRealTimers());

		it('preselects the current month', () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-03-10T12:00:00Z'));

			const { body } = render(Page, { props: { form: null } });

			expect(
				parseRenderedBody(body).querySelector('select[name="mes"] option[selected]')?.getAttribute('value'),
			).toBe('03');
		});
	});

	it('titles a list of every month without a month name', () => {
		const { body } = render(Page, {
			props: {
				form: {
					mes: null,
					leitores: [
						{ nome: 'MARIA', aniversario: new Date('2026-01-15T00:00:00.000Z'), desencarnado: false },
					],
				},
			},
		});

		const heading = parseRenderedBody(body).querySelector('#printable-content h2');

		expect(heading?.textContent?.replace(/\s+/g, ' ').trim()).toMatch(/^Aniversariantes do mês \/ \d{4}$/);
	});
});

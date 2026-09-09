import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/aniversariantes/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

describe('birthday list page', () => {
	it('renders the birthday month in Portuguese', () => {
		const { body } = render(Page, {
			props: {
				form: {
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
});

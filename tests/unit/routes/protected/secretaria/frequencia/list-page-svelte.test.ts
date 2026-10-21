import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/frequencia/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

const renderPage = (form: { leitores: { nome: string }[]; datas: string[] } | null) =>
	parseRenderedBody(render(Page, { props: { form } }).body);

describe('secretaria attendance list page', () => {
	it('preselects the usual meeting weekdays in the filters', () => {
		const document = renderPage(null);

		const checked = [...document.querySelectorAll('input[name="dias"]:checked')].map((input) =>
			input.getAttribute('value'),
		);

		expect(checked).toEqual(['1', '2', '4']);
	});

	it('requires both dates of the attendance period', () => {
		const document = renderPage(null);

		const dates = [...document.querySelectorAll('input[type="date"]')];

		expect(dates.map((input) => [input.getAttribute('name'), input.hasAttribute('required')])).toEqual([
			['dataInicio', true],
			['dataFim', true],
		]);
	});

	it('links to the attendance registration', () => {
		const document = renderPage(null);

		const link = document.querySelector('a[href="/secretaria/frequencia/registro"]');

		expect(link?.textContent).toBe('Clique aqui para registrar as frequências');
	});

	it('does not render the printable list before it is generated', () => {
		const document = renderPage(null);

		expect(document.querySelector('#printable-content')).toBeNull();
	});

	it('renders a mark column per selected date and the uppercased worker names', () => {
		const document = renderPage({ leitores: [{ nome: 'Maria da Silva' }], datas: ['02', '03'] });

		const headings = [...document.querySelectorAll('#printable-content th')].map((th) => th.textContent?.trim());
		const cells = [...document.querySelectorAll('#printable-content tbody td')].map((td) => td.textContent?.trim());

		expect(headings).toEqual(['02', '03', 'Nome']);
		expect(cells).toEqual(['[  ]', '[  ]', 'MARIA DA SILVA']);
	});
});

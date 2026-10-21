import { render } from 'svelte/server';
import { expect, it } from 'vitest';
import Page from '../../../../../../src/routes/(protected)/biblioteca/emprestimos/[id=integer]/recibo/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

const recibo = {
	idemp: 7,
	leitor: 'Maria da Conceição Souza',
	tombo: '0457',
	titulo: 'O Livro dos Espíritos',
	exemplar: 2,
	dataEmprestimo: '01/10/2026',
	dataDevolucao: '15/10/2026',
};

it('renders the breadcrumb, a single heading and both receipt copies', () => {
	const { body } = render(Page, { props: { data: { recibo } } });

	const rendered = parseRenderedBody(body);
	expect(rendered.querySelector('header[data-print="hidden"] nav[aria-label="breadcrumbs"]')).not.toBeNull();
	expect(Array.from(rendered.querySelectorAll('h1')).map((heading) => heading.textContent?.trim())).toEqual([
		'Recibo',
	]);
	expect(rendered.querySelector('section[aria-label="Via da biblioteca"]')).not.toBeNull();
	expect(rendered.querySelector('section[aria-label="Via do leitor"]')).not.toBeNull();
});

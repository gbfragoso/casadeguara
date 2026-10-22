import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/secretaria/frequencia/registro/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

type RegistrationList = { leitores: { id: number; nome: string }[]; datas: string[]; fulldates: string[] };

const renderPage = (form: RegistrationList | null) => parseRenderedBody(render(Page, { props: { form } }).body);

describe('secretaria attendance registration page', () => {
	it('only offers the search before a list is generated', () => {
		const document = renderPage(null);

		const actions = [...document.querySelectorAll('form')].map((form) => form.getAttribute('action'));

		expect(actions).toEqual(['?/pesquisar']);
	});

	it('renders one attendance checkbox per worker and selected date', () => {
		const document = renderPage({
			leitores: [{ id: 7, nome: 'Maria' }],
			datas: ['02', '03'],
			fulldates: ['2026-10-02', '2026-10-03'],
		});

		const checkboxes = [...document.querySelectorAll('form[action="?/registrar"] input[type="checkbox"]')];

		expect(checkboxes.map((input) => [input.getAttribute('name'), input.getAttribute('value')])).toEqual([
			['7', '2026-10-02'],
			['7', '2026-10-03'],
		]);
		expect(document.querySelector('form[action="?/registrar"] tbody')?.textContent).toContain('MARIA');
	});

	it('submits the generated list through the registration action', () => {
		const document = renderPage({ leitores: [{ id: 4, nome: 'Maria' }], datas: ['02'], fulldates: ['2026-10-02'] });

		const submit = document.querySelector('form[action="?/registrar"] button[type="submit"]');

		expect(submit?.textContent?.trim()).toBe('Concluir registro');
	});

	it('offers no registration when no worker is marked for attendance', () => {
		const document = renderPage({ leitores: [], datas: ['02'], fulldates: ['2026-10-02'] });

		expect(document.querySelector('form[action="?/registrar"]')).toBeNull();
		expect(document.querySelector('[role="status"]')?.textContent).toContain('Marque-os em Cadastros');
	});
});

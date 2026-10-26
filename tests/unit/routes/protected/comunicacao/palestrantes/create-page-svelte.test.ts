import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/comunicacao/palestrantes/novo/+page.svelte';
import { parseRenderedBody } from '../../../../support/rendered-document';

describe('new speaker page', () => {
	it('asks for a name of up to 60 characters', () => {
		const document = parseRenderedBody(render(Page, { props: { form: null } }).body);

		const name = document.querySelector('input[name="nome"]');

		expect(document.querySelector('label[for="nome"]')?.textContent).toBe('Nome');
		expect([name?.getAttribute('maxlength'), name?.hasAttribute('required')]).toEqual(['60', true]);
	});

	it('CA-29 keeps the typed name and shows the duplicate-name error', () => {
		const form = {
			values: { nome: 'carmelia amorim' },
			errors: { nome: ['Já existe um palestrante com esse nome.'] },
		};

		const document = parseRenderedBody(render(Page, { props: { form } }).body);

		expect(document.querySelector('input[name="nome"]')?.getAttribute('value')).toBe('carmelia amorim');
		expect(document.querySelector('#nome-errors')?.textContent).toContain(
			'Já existe um palestrante com esse nome.',
		);
	});
});

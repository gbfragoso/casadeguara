import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/livros/novo/+page.svelte';
import { getRenderedButton, getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const data = {
	editoras: [{ ideditora: 3, nome: 'Editora A' }],
	colecoes: [{ idserie: 5, nome: 'Coleção A' }],
	autores: [{ idautor: 7, nome: 'Autor A' }],
};

describe('new book page', () => {
	it('renders required fields and stable catalog options', () => {
		const { body } = render(Page, { props: { data, form: null } });
		const document = parseRenderedBody(body);

		expect(getRenderedInput(document, 'input[name="tombo"]').required).toBe(true);
		expect(getRenderedInput(document, 'input[name="tombo"]').maxLength).toBe(8);
		expect(getRenderedInput(document, 'input[name="titulo"]').required).toBe(true);
		expect(document.querySelector('label[for="editora"]')?.textContent).toBe('Editora');
		expect(document.querySelector('select[name="editora"]')?.hasAttribute('required')).toBe(true);
		expect(document.querySelectorAll('select[name="editora"] option')).toHaveLength(2);
		expect(document.querySelectorAll('select[name="colecao"] option')).toHaveLength(2);
		expect(document.querySelectorAll('fieldset')).toHaveLength(3);
		expect(document.querySelectorAll('select[name="autores"] option')).toHaveLength(1);
		expect(document.querySelector('input[name="novoAutor"]')?.getAttribute('maxlength')).toBe('60');
		expect(document.body.textContent).toMatch(/exemplar inicial/i);
		expect(getRenderedButton(document, 'button[type="submit"]').textContent).toContain('Cadastrar');
	});

	it('preserves safe values and all field errors after validation', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: {
						tombo: 'abc',
						titulo: '123',
						editora: '0',
						colecao: '9',
						ordem: '2',
						autores: ['7'],
						novoAutor: 'Maria',
					},
					errors: {
						tombo: ['Tombo inválido.'],
						titulo: ['Título da obra deve conter ao menos uma letra.'],
						editora: ['Editora inválida.'],
						colecao: ['Coleção inválida.'],
						ordem: ['Ordem exige uma coleção.'],
						autores: ['Autor inválido.'],
					},
				},
			},
		});
		const document = parseRenderedBody(body);

		expect(getRenderedInput(document, 'input[name="tombo"]').value).toBe('abc');
		expect(getRenderedInput(document, 'input[name="titulo"]').value).toBe('123');
		expect(document.querySelector('select[name="editora"]')?.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('select[name="colecao"]')?.getAttribute('aria-describedby')).toBe(
			'colecao-errors',
		);
		expect(document.querySelector('#tombo-errors')?.textContent).toContain('Tombo inválido.');
		expect(document.querySelector('#ordem-errors')?.textContent).toContain('Ordem exige uma coleção.');
		expect(document.querySelector('#autores-errors')?.textContent).toContain('Autor inválido.');
		expect(getRenderedInput(document, 'input[name="novoAutor"]').value).toBe('Maria');
		expect(document.querySelector('select[name="autores"] option[selected]')?.getAttribute('value')).toBe('7');
	});

	it('announces a successful creation through Notification', () => {
		const { body } = render(Page, {
			props: { data, form: { outcome: 'created', message: 'Livro cadastrado com sucesso.' } },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('.notification')?.textContent).toContain('Livro cadastrado com sucesso.');
		const submit = getRenderedButton(document, 'button[type="submit"]');
		expect(submit.getAttribute('aria-busy')).toBe('false');
		expect(submit.disabled).toBe(false);
	});

	it('renders a public failure message without replacing field values', () => {
		const { body } = render(Page, {
			props: { data, form: { values: { tombo: '000123' }, message: 'Falha ao cadastrar um novo livro.' } },
		});
		const document = parseRenderedBody(body);

		expect(document.querySelector('.notification.is-danger')?.textContent).toContain(
			'Falha ao cadastrar um novo livro.',
		);
		expect(getRenderedInput(document, 'input[name="tombo"]').value).toBe('000123');
	});
});

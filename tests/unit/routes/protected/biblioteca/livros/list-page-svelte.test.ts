import { HTMLSelectElement } from 'happy-dom';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from '../../../../../../src/routes/(protected)/biblioteca/livros/+page.svelte';
import { getRenderedAnchor, getRenderedInput, parseRenderedBody } from '../../../../support/rendered-document';

const data = {
	colecoes: [
		{ idserie: 2, nome: 'Aventura' },
		{ idserie: 4, nome: 'História' },
	],
	isAdmin: false,
	role: 'biblioteca',
};

describe('book list page', () => {
	it('renders the initial search form without an empty result state', () => {
		const { body } = render(Page, {
			props: { data, form: { values: {}, errors: {} } },
		});
		const document = parseRenderedBody(body);
		const tombo = getRenderedInput(document, 'input[name="tombo"]');

		expect(document.querySelector('h1')?.textContent).toBe('Consulta de livros');
		expect(tombo.type).toBe('text');
		expect(tombo.maxLength).toBe(8);
		expect(document.querySelector('label[for="keyword"]')?.textContent).toBe('Palavra-chave');
		expect(document.querySelectorAll('#colecao option')).toHaveLength(3);
		expect(document.body.textContent).not.toContain('Nenhum livro encontrado.');
		expect(document.querySelector('table')).toBeNull();
	});

	it('preserves submitted values and associates every validation message', () => {
		const { body } = render(Page, {
			props: {
				data,
				form: {
					values: {
						tombo: '000123',
						titulo: '123',
						autor: 'Jorge',
						editora: 'Editora',
						colecao: '4',
						keyword: 'arte',
					},
					errors: {
						tombo: ['Tombo inválido.'],
						titulo: ['Título da obra deve conter ao menos uma letra.', 'Outra mensagem.'],
						autor: ['Autor inválido.'],
						editora: ['Editora inválida.'],
						colecao: ['Coleção inválida.'],
						keyword: ['Palavra-chave inválida.'],
					},
				},
			},
		});
		const document = parseRenderedBody(body);

		expect(getRenderedInput(document, 'input[name="tombo"]').value).toBe('000123');
		expect(getRenderedInput(document, 'input[name="titulo"]').value).toBe('123');
		expect(getRenderedInput(document, 'input[name="autor"]').value).toBe('Jorge');
		expect(getRenderedInput(document, 'input[name="editora"]').value).toBe('Editora');
		expect(getRenderedInput(document, 'input[name="keyword"]').value).toBe('arte');
		const collection = document.querySelector('select[name="colecao"]');
		if (!(collection instanceof HTMLSelectElement)) throw new Error('Expected collection select.');
		expect(collection.querySelector('option[selected]')?.getAttribute('value')).toBe('4');
		expect(document.querySelector('select[name="colecao"]')?.getAttribute('aria-invalid')).toBe('true');
		expect(document.querySelector('#titulo-errors')?.textContent).toContain('Outra mensagem.');
		expect(document.querySelector('#autor-errors')?.textContent).toContain('Autor inválido.');
		expect(document.querySelector('#editora-errors')?.textContent).toContain('Editora inválida.');
		expect(document.querySelector('#colecao-errors')?.textContent).toContain('Coleção inválida.');
		expect(document.querySelector('#keyword-errors')?.textContent).toContain('Palavra-chave inválida.');
	});

	it('renders a distinct empty state after a completed search', () => {
		const { body } = render(Page, { props: { data, form: { livros: [], values: {} } } });
		const document = parseRenderedBody(body);

		expect(document.querySelector('[role="status"]')?.textContent).toBe('Nenhum livro encontrado.');
		expect(document.querySelector('table')).toBeNull();
	});

	it('renders descriptive links and keeps related rows distinguishable', () => {
		const livros = [
			{ idlivro: 8, tombo: '000008', titulo: 'Livro', keyword: 'Arte', referencia: 'Ensaio' },
			{ idlivro: 8, tombo: '000008', titulo: 'Livro', keyword: 'História', referencia: 'Pesquisa' },
		];
		const { body } = render(Page, { props: { data, form: { livros, values: {} } } });
		const document = parseRenderedBody(body);

		expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
		expect(getRenderedAnchor(document, 'tbody a[aria-label^="Editar livro"]').getAttribute('aria-label')).toBe(
			'Editar livro Livro',
		);
		expect(document.querySelector('a[aria-label="Autores do livro Livro"]')).not.toBeNull();
		expect(document.querySelector('a[aria-label="Exemplares do livro Livro"]')).not.toBeNull();
		expect(document.querySelector('a[aria-label="Palavras-chave do livro Livro"]')).not.toBeNull();
	});

	it('offers an administrative trash-can popup only to administrators', () => {
		const livro = { idlivro: 8, tombo: '000008', titulo: 'Livro', keyword: null, referencia: null };
		const { body: regularBody } = render(Page, { props: { data, form: { livros: [livro], values: {} } } });
		const regularDocument = parseRenderedBody(regularBody);
		expect(regularDocument.querySelector('button[popovertarget]')).toBeNull();

		const { body: adminBody } = render(Page, {
			props: {
				data: { ...data, isAdmin: true, role: 'biblioteca:admin' },
				form: { livros: [livro], values: {} },
			},
		});
		const adminDocument = parseRenderedBody(adminBody);
		const trigger = adminDocument.querySelector('button[popovertarget]');
		const popup = adminDocument.querySelector('[popover="auto"]');

		expect(trigger?.getAttribute('aria-label')).toBe('Excluir livro Livro');
		expect(trigger?.querySelector('.fa-trash-can')).not.toBeNull();
		expect(trigger?.getAttribute('popovertarget')).toBe(popup?.id);
		expect(popup?.getAttribute('role')).toBe('dialog');
		expect(popup?.querySelector('form')?.getAttribute('action')).toBe('?/excluir');
		expect(popup?.querySelector('input[name="idlivro"]')?.getAttribute('value')).toBe('8');
		expect(popup?.querySelector('button[type="submit"]')?.getAttribute('aria-label')).toBe(
			'Confirmar exclusão do livro Livro',
		);
	});

	it('announces delete success and public failures', () => {
		const success = render(Page, {
			props: { data, form: { outcome: 'deleted', message: 'Livro excluído com sucesso.' } },
		});
		expect(parseRenderedBody(success.body).querySelector('.notification.is-success')?.textContent).toContain(
			'Livro excluído com sucesso.',
		);

		const failure = render(Page, {
			props: { data, form: { values: { idlivro: '8' }, message: 'Falha ao excluir o livro.' } },
		});
		expect(parseRenderedBody(failure.body).querySelector('.notification.is-danger')?.textContent).toContain(
			'Falha ao excluir o livro.',
		);
	});
});

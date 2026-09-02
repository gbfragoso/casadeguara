import { describe, expect, it } from 'vitest';

import { getLivroErrors, getLivroFormValues, getLivroSearchValues } from '$lib/server/biblioteca/books/form';

describe('livro form state helpers', () => {
	it('keeps only known string search values', () => {
		const values = getLivroSearchValues({
			tombo: '000001',
			titulo: 'Livro',
			serie: '4',
			extra: 'remove',
			file: new File(['x'], 'book.txt'),
		});

		expect(values).toEqual({
			tombo: '000001',
			titulo: 'Livro',
			autor: '',
			editora: '',
			serie: '4',
			colecao: '',
			keyword: '',
		});
	});

	it('keeps only known string create values from FormData', () => {
		const form = new FormData();
		form.set('tombo', '000001');
		form.set('titulo', 'Livro');
		form.set('editora', '4');
		form.append('autores', '7');
		form.append('autores', '11');
		form.set('novoAutor', 'Maria');
		form.set('arquivo', new File(['x'], 'book.txt'));

		expect(getLivroFormValues(form)).toEqual({
			tombo: '000001',
			titulo: 'Livro',
			editora: '4',
			colecao: '',
			ordem: '',
			novoAutor: 'Maria',
			autores: ['7', '11'],
		});
	});

	it('groups safe messages and removes unknown or non-string errors', () => {
		const errors = getLivroErrors({ titulo: ['Título inválido.', 42], unknown: ['não exibir'], tombo: [] });

		expect(errors).toEqual({ titulo: ['Título inválido.'] });
	});
});

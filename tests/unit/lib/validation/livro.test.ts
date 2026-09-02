import { describe, expect, it } from 'vitest';

import { livroCreateSchema, livroDeleteSchema, livroSearchSchema } from '$lib/validation/livro';

describe('livro validation', () => {
	it('normalizes empty search values and form aliases', () => {
		const result = livroSearchSchema.safeParse({
			tombo: '  ',
			titulo: '  Capitães  ',
			colecao: '4',
			autor: '',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				tombo: undefined,
				titulo: 'Capitães',
				autor: undefined,
				editora: undefined,
				colecaoId: 4,
				keyword: undefined,
			});
		}
	});

	it('reports every invalid search field at its own path', () => {
		const result = livroSearchSchema.safeParse({
			tombo: 'abc',
			titulo: 'x'.repeat(81),
			autor: 'x'.repeat(61),
			editora: 'x'.repeat(61),
			colecaoId: '0',
			keyword: 'x'.repeat(31),
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map((issue) => issue.path[0]);
			expect(paths).toEqual(
				expect.arrayContaining(['tombo', 'titulo', 'autor', 'editora', 'colecaoId', 'keyword']),
			);
		}
	});

	it('rejects non-string identifiers and missing required values', () => {
		const invalidSearch = livroSearchSchema.safeParse({ colecaoId: { id: 4 }, tombo: 4 });
		const missingCreateFields = livroCreateSchema.safeParse({ titulo: 'Livro' });

		expect(invalidSearch.success).toBe(false);
		expect(missingCreateFields.success).toBe(false);
	});

	it('validates a trimmed create payload and collection order dependency', () => {
		const valid = livroCreateSchema.safeParse({
			tombo: ' 000123 ',
			titulo: ' Tenda  ',
			editora: '12',
			colecao: '4',
			ordem: '2',
			autores: ['7', '7', '11'],
		});
		const invalid = livroCreateSchema.safeParse({ tombo: '123', titulo: '123', editoraId: '12', ordem: '1' });

		expect(valid.success).toBe(true);
		if (valid.success)
			expect(valid.data).toEqual({
				tombo: '000123',
				titulo: 'Tenda',
				editoraId: 12,
				colecaoId: 4,
				ordem: 2,
				autorIds: [7, 11],
				novoAutor: undefined,
			});
		expect(invalid.success).toBe(false);
		if (!invalid.success)
			expect(invalid.error.issues.map((issue) => issue.path[0])).toEqual(
				expect.arrayContaining(['titulo', 'ordem', 'autorIds']),
			);
	});

	it('accepts a new author as the required authorship source', () => {
		const result = livroCreateSchema.safeParse({
			tombo: '123',
			titulo: 'Livro',
			editora: '12',
			novoAutor: '  Maria da Silva  ',
		});

		expect(result.success).toBe(true);
		if (result.success) expect(result.data).toMatchObject({ autorIds: [], novoAutor: 'MARIA DA SILVA' });
	});

	it('rejects invalid delete identifiers', () => {
		const valid = livroDeleteSchema.safeParse({ id: '42' });
		const invalid = livroDeleteSchema.safeParse({ idlivro: '0' });

		expect(valid.success).toBe(true);
		if (valid.success) expect(valid.data).toEqual({ idlivro: 42 });
		expect(invalid.success).toBe(false);
	});
});

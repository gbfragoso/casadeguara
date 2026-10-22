import { afterEach, describe, expect, it, vi } from 'vitest';

import { describeBookAssociationHandlers } from '../../../../support/book-association-suite';
import { fakeDatabase } from '../../../../support/fake-database';
import { runHandler } from '../../../../support/handler-event';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaLivrosIdIntegerKeywordsHandlers } =
	await import('#lib/server/biblioteca/livros/id-keywords-handlers.js');

const librarian = { roles: 'biblioteca', params: { id: '3' } };
const MAX_REFERENCE_LENGTH = 100;

describe('createBibliotecaLivrosIdIntegerKeywordsHandlers', () => {
	describeBookAssociationHandlers({
		field: 'keyword',
		listKeys: ['keywords', 'keywordsLivro'],
		createHandlers: createBibliotecaLivrosIdIntegerKeywordsHandlers,
		additionalValues: { referencia: null },
	});

	describe('keyword reference', () => {
		afterEach(() => fakeDatabase.reset());

		it('saves the trimmed reference informed for the keyword', async () => {
			await runHandler(createBibliotecaLivrosIdIntegerKeywordsHandlers().actions.adicionar, {
				...librarian,
				form: { keyword: '5', referencia: '  capítulo 3  ' },
			});

			expect(fakeDatabase.argumentsOf('values')).toEqual([{ keyword: 5, livro: 3, referencia: 'capítulo 3' }]);
		});

		it('rejects a reference longer than the column allows without saving it', async () => {
			const { result } = await runHandler(createBibliotecaLivrosIdIntegerKeywordsHandlers().actions.adicionar, {
				...librarian,
				form: { keyword: '5', referencia: 'a'.repeat(MAX_REFERENCE_LENGTH + 1) },
			});

			expect(result).toMatchObject({
				status: 400,
				data: { errors: { referencia: ['A referência deve ter até 100 caracteres.'] } },
			});
			expect(fakeDatabase.queries()).toHaveLength(0);
		});
	});
});

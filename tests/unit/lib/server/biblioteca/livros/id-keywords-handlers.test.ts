import { describe, vi } from 'vitest';

import { describeBookAssociationHandlers } from '../../../../support/book-association-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaLivrosIdIntegerKeywordsHandlers } =
	await import('#lib/server/biblioteca/livros/id-keywords-handlers.js');

describe('createBibliotecaLivrosIdIntegerKeywordsHandlers', () => {
	describeBookAssociationHandlers({
		field: 'keyword',
		listKeys: ['keywords', 'keywordsLivro'],
		createHandlers: createBibliotecaLivrosIdIntegerKeywordsHandlers,
	});
});

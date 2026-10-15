import { describe, vi } from 'vitest';

import { describeBookAssociationHandlers } from '../../../../support/book-association-suite';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { createBibliotecaLivrosIdIntegerAutoresHandlers } =
	await import('#lib/server/biblioteca/livros/id-autores-handlers.js');

describe('createBibliotecaLivrosIdIntegerAutoresHandlers', () => {
	describeBookAssociationHandlers({
		field: 'autor',
		listKeys: ['autores', 'autoresLivro'],
		createHandlers: createBibliotecaLivrosIdIntegerAutoresHandlers,
	});
});

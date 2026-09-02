import { describe, expect, it } from 'vitest';

import { getLivroActionErrors } from '$lib/server/biblioteca/books/form';

describe('getLivroActionErrors', () => {
	it('maps canonical schema paths to submitted field names', () => {
		expect(getLivroActionErrors({ editoraId: ['Editora inválida.'], colecaoId: ['Coleção inválida.'] })).toEqual({
			editora: ['Editora inválida.'],
			colecao: ['Coleção inválida.'],
		});
	});
});

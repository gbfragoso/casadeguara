import { describe, expect, it } from 'vitest';

import { bibliotecaCreateActions, bibliotecaListActions } from '../../../support/biblioteca-route-actions';
import { bibliotecaUser } from '../../../support/auth';
import { createRawCadastro, createTestName, deleteCadastro } from '../../../lib/server/models/cadastro/test-support';
import { createRequestEvent, invoke } from '../../../support/request-event';

const actionEvent = (field: string, value?: string) => {
	const form = new FormData();
	if (value !== undefined) form.set(field, value);

	return createRequestEvent({
		locals: { user: bibliotecaUser, session: null },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('TI-07 biblioteca list and create actions', () => {
	it('returns validation failures for every protected action with an empty form', async () => {
		const results = await Promise.all(
			[...bibliotecaCreateActions, ...bibliotecaListActions].map((action) => invoke(action, actionEvent('nome'))),
		);

		expect(results.every((result) => result && 'status' in result && result.status === 400)).toBe(true);
	});

	it('executes each list action with an authorized valid search', async () => {
		const fields = ['nome', 'nome', 'nome', 'chave', 'nome'];
		const reader = await createRawCadastro(createTestName('route-reader-list'));
		try {
			const results = await Promise.all(
				bibliotecaListActions.map((action, index) => invoke(action, actionEvent(fields[index], 'T'))),
			);

			expect(results).toHaveLength(bibliotecaListActions.length);
			expect(results.every((result) => result && !('status' in result))).toBe(true);
		} finally {
			await deleteCadastro(reader.idleitor);
		}
	});
});

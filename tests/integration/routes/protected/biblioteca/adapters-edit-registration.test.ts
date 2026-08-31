import { describe, expect, it } from 'vitest';

import { createRawCadastro, createTestName, deleteCadastro } from '../../../lib/server/models/cadastro/test-support';
import { bibliotecaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import {
	actions as readerActions,
	load as readerLoad,
} from '../../../../../src/routes/(protected)/biblioteca/leitores/[id=integer]/+page.server';

const event = (field: string, value: string, id: number) => {
	const form = new FormData();
	form.set(field, value);

	return createRequestEvent({
		locals: { user: bibliotecaUser, session: null },
		params: { id: `${id}` },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('TI-07 biblioteca registration and notice edits', () => {
	it('updates a reader through the real export and rejects an absent reader', async () => {
		const created = await createRawCadastro(createTestName('route-reader-edit'));
		const duplicateName = createTestName('route-reader-duplicate').toLocaleUpperCase('pt-BR');
		const duplicate = await createRawCadastro(duplicateName);

		try {
			const loaded = await invoke(
				readerLoad,
				createRequestEvent({
					locals: { user: bibliotecaUser, session: null },
					params: { id: `${created.idleitor}` },
				}),
			);
			const invalid = await invoke(readerActions.default, event('nome', '', created.idleitor));
			const updated = await invoke(
				readerActions.default,
				event('nome', createTestName('route-reader-updated'), created.idleitor),
			);
			const duplicateUpdate = await invoke(readerActions.default, event('nome', duplicateName, created.idleitor));

			expect(loaded).toBeDefined();
			expect(invalid).toMatchObject({ status: 400 });
			expect(updated).toEqual({ status: 200 });
			expect(duplicateUpdate).toMatchObject({ status: 400 });
			await expect(
				invoke(
					readerLoad,
					createRequestEvent({ locals: { user: bibliotecaUser, session: null }, params: { id: '-1' } }),
				),
			).rejects.toMatchObject({ status: 404 });
			await expect(
				invoke(readerActions.default, event('nome', createTestName('route-reader-absent'), -1)),
			).rejects.toMatchObject({ status: 404 });
		} finally {
			await deleteCadastro(created.idleitor);
			await deleteCadastro(duplicate.idleitor);
		}
	});
});

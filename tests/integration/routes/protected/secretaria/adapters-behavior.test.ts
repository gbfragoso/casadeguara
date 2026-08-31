import { describe, expect, it } from 'vitest';
import { secretariaUser } from '../../../support/auth';
import { createRawCadastro, createTestName, deleteCadastro } from '../../../lib/server/models/cadastro/test-support';
import { createRequestEvent, invoke } from '../../../support/request-event';
import {
	actions as editActions,
	load as editLoad,
} from '../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server';

const actionEvent = (entries: Record<string, string>, id?: number) => {
	const form = new FormData();
	for (const [key, value] of Object.entries(entries)) form.set(key, value);

	return createRequestEvent({
		locals: { user: secretariaUser, session: null },
		params: id === undefined ? {} : { id: `${id}` },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('TI-07 secretaria route behavior', () => {
	it('loads and updates an existing worker through the real edit export', async () => {
		const created = await createRawCadastro(createTestName('route-worker-edit'));
		const duplicateName = createTestName('route-worker-duplicate').toLocaleUpperCase('pt-BR');
		const duplicate = await createRawCadastro(duplicateName);

		try {
			const loaded = await invoke(
				editLoad,
				createRequestEvent({
					locals: { user: secretariaUser, session: null },
					params: { id: `${created.idleitor}` },
				}),
			);
			const invalid = await invoke(editActions.salvarCadastro, actionEvent({}, created.idleitor));
			const updated = await invoke(
				editActions.salvarCadastro,
				actionEvent({ nome: createTestName('route-worker-updated') }, created.idleitor),
			);
			const duplicateUpdate = await invoke(
				editActions.salvarCadastro,
				actionEvent({ nome: duplicateName }, created.idleitor),
			);
			const savedPhoto = await invoke(editActions.salvarFoto, actionEvent({}, created.idleitor));
			const reframedPhoto = await invoke(editActions.reenquadrarFoto, actionEvent({}, created.idleitor));

			expect(loaded).toBeDefined();
			expect(invalid).toMatchObject({ status: 400 });
			expect(updated).toEqual({ status: 200 });
			expect(duplicateUpdate).toMatchObject({ status: 400 });
			expect(savedPhoto).toMatchObject({ status: 400 });
			expect(reframedPhoto).toMatchObject({ status: 400 });
			const removedPhoto = await invoke(editActions.removerFoto, actionEvent({}, created.idleitor));
			expect(removedPhoto).toMatchObject({ status: 200 });
			await expect(
				invoke(
					editLoad,
					createRequestEvent({ locals: { user: secretariaUser, session: null }, params: { id: '-1' } }),
				),
			).rejects.toMatchObject({ status: 404 });
		} finally {
			await deleteCadastro(created.idleitor);
			await deleteCadastro(duplicate.idleitor);
		}
	});
});

import { describe, expect, it } from 'vitest';

import { tesourariaUser } from '../../../support/auth';
import { createRawCadastro, createTestName, deleteCadastro } from '../../../lib/server/models/cadastro/test-support';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { actions as listActions } from '../../../../../src/routes/(protected)/tesouraria/contribuintes/+page.server';
import {
	actions as editActions,
	load as editLoad,
} from '../../../../../src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.server';

const event = (entries: Record<string, string>, id?: number) => {
	const form = new FormData();
	for (const [key, value] of Object.entries(entries)) form.set(key, value);

	return createRequestEvent({
		locals: { user: tesourariaUser, session: null },
		params: id === undefined ? {} : { id: `${id}` },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('TI-07 tesouraria route behavior', () => {
	it('returns validation and successful results through the contributor list action', async () => {
		const created = await createRawCadastro(createTestName('route-contributor-list'));
		const invalid = await invoke(listActions.default, event({}));
		const valid = await invoke(listActions.default, event({ nome: 'T' }));

		try {
			expect(invalid).toMatchObject({ status: 400 });
			expect(valid).toEqual(expect.objectContaining({ contribuintes: expect.any(Array) }));
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});

	it('loads and updates an existing contributor through the real edit export', async () => {
		const created = await createRawCadastro(createTestName('route-contributor-edit'));

		try {
			const loaded = await invoke(
				editLoad,
				createRequestEvent({
					locals: { user: tesourariaUser, session: null },
					params: { id: `${created.idleitor}` },
				}),
			);
			const invalid = await invoke(editActions.default, event({}, created.idleitor));
			const updated = await invoke(
				editActions.default,
				event({ nome: createTestName('route-contributor-updated') }, created.idleitor),
			);

			expect(loaded).toBeDefined();
			expect(invalid).toMatchObject({ status: 400 });
			expect(updated).toEqual({ status: 200 });
			await expect(
				invoke(
					editLoad,
					createRequestEvent({ locals: { user: tesourariaUser, session: null }, params: { id: '-1' } }),
				),
			).rejects.toMatchObject({ status: 404 });
			await expect(
				invoke(editActions.default, event({ nome: createTestName('route-contributor-absent') }, -1)),
			).rejects.toMatchObject({ status: 404 });
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});
});

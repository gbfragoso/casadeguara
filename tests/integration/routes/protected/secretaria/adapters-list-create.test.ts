import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/database/connection';
import { cadastros } from '$lib/server/database/schema';
import { createRawCadastro, createTestName, deleteCadastro } from '../../../lib/server/models/cadastro/test-support';
import { secretariaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { actions as listActions } from '../../../../../src/routes/(protected)/secretaria/cadastros/+page.server';
import { actions as newActions } from '../../../../../src/routes/(protected)/secretaria/cadastros/novo/+page.server';

const actionEvent = (entries: Record<string, string>) => {
	const form = new FormData();
	for (const [key, value] of Object.entries(entries)) form.set(key, value);

	return createRequestEvent({
		locals: { user: secretariaUser, session: null },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('TI-07 secretaria list and create actions', () => {
	it('returns validation and successful search results through the list action', async () => {
		const seeded = await createRawCadastro(createTestName('route-worker-list'));

		try {
			const invalid = await invoke(listActions.default, actionEvent({}));
			const valid = await invoke(listActions.default, actionEvent({ nome: 'T', trabalhadores: 'true' }));

			expect(invalid).toMatchObject({ status: 400 });
			expect(valid).toEqual(
				expect.objectContaining({
					cadastros: expect.arrayContaining([expect.objectContaining({ idleitor: seeded.idleitor })]),
				}),
			);
		} finally {
			await deleteCadastro(seeded.idleitor);
		}
	});

	it('commits a worker and reports a duplicate through the create action', async () => {
		const nome = createTestName('route-worker').toLocaleUpperCase('pt-BR');
		const first = await invoke(newActions.default, actionEvent({ nome }));
		const duplicate = await invoke(newActions.default, actionEvent({ nome }));
		const [created] = await db.select({ id: cadastros.idleitor }).from(cadastros).where(eq(cadastros.nome, nome));

		try {
			expect(first).toEqual({ status: 201 });
			expect(duplicate).toMatchObject({ status: 400 });
		} finally {
			if (created) await deleteCadastro(created.id);
		}
	});
});

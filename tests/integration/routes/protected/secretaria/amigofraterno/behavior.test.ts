import { describe, expect, it } from 'vitest';

import { db } from '$lib/server/database/connection';
import { cadastros } from '$lib/server/database/schema';
import { createTestName, deleteCadastro } from '../../../../lib/server/models/cadastro/test-support';
import { secretariaUser } from '../../../../support/auth';
import { createRequestEvent, invoke } from '../../../../support/request-event';
import { load } from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/+page.server';

describe('TI-07 Amigo Fraterno page load', () => {
	it('counts eligible participants and those without photos for an authorized user', async () => {
		const [created] = await db
			.insert(cadastros)
			.values({ nome: createTestName('route-amigo'), amigoFraterno: true, trab: true })
			.returning({ id: cadastros.idleitor });
		if (!created) throw new Error('Participante de teste não criado.');

		try {
			const result = await invoke(load, createRequestEvent({ locals: { user: secretariaUser, session: null } }));

			expect(result).toEqual(
				expect.objectContaining({ total: expect.any(Number), withoutPhoto: expect.any(Number) }),
			);
		} finally {
			await deleteCadastro(created.id);
		}
	});
});

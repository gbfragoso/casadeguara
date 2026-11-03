import { randomUUID } from 'node:crypto';

import { db } from '#lib/server/database/connection.js';
import type { ListedUserAccount } from '#lib/server/users/accounts/list-handlers.js';
import { user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { withUsers } from '../../../lib/server/models/user-test-support';
import { invoke } from '../../../support/request-event';
import { load } from '../../../../../src/routes/(protected)/usuarios/+page.server';
import { SUPERUSER, createGetEvent } from './support';

describe('TI-03 user list load', () => {
	it('lists every user by unaccented name, with "Sem acesso" for a user without roles', async () => {
		await withUsers(['', 'biblioteca:admin,superuser'], async ([brunaId, alvaroId]) => {
			const suffix = randomUUID();
			await db
				.update(user)
				.set({ name: `Bruna ${suffix}` })
				.where(eq(user.id, brunaId));
			await db
				.update(user)
				.set({ name: `Álvaro ${suffix}` })
				.where(eq(user.id, alvaroId));

			const data = await invoke(load, createGetEvent(SUPERUSER));
			const usuarios: ListedUserAccount[] = data && 'usuarios' in data ? data.usuarios : [];
			const listed = usuarios
				.filter(({ id }) => id === brunaId || id === alvaroId)
				.map(({ name, accessSummary }) => [name, accessSummary]);

			expect(listed).toEqual([
				[`Álvaro ${suffix}`, 'Biblioteca: Coordenação, Superusuário'],
				[`Bruna ${suffix}`, 'Sem acesso'],
			]);
		});
	});
});

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createTestUsername, withUsers } from '../../../lib/server/models/user-test-support';
import { secretariaAdminUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import {
	actions as editActions,
	load as editLoad,
} from '../../../../../src/routes/(protected)/secretaria/usuarios/[id=alphanumeric]/+page.server';

const editEvent = (id: string, entries?: Record<string, string>) => {
	const form = new FormData();
	Object.entries(entries ?? {}).forEach(([key, value]) => form.set(key, value));

	return createRequestEvent({
		locals: { user: secretariaAdminUser, session: null },
		params: { id },
		...(entries && { request: new Request('http://localhost/', { method: 'POST', body: form }) }),
	});
};

const readRoles = async (id: string) => {
	const [stored] = await db.select({ roles: user.roles }).from(user).where(eq(user.id, id));

	return stored?.roles;
};

describe('TI-18 Secretaria user routes', () => {
	it('changes the sector while keeping the Comunicação role', async () => {
		await withUsers(['secretaria,comunicacao'], async ([id]) => {
			const loaded = await invoke(editLoad, editEvent(id));
			const form = {
				username: createTestUsername(),
				password: 'senha-segura',
				name: 'Teste',
				roles: 'tesouraria',
			};

			const result = await invoke(editActions.default, editEvent(id, form));

			expect(loaded).toMatchObject({ usuario: { roles: 'secretaria' } });
			expect(result).toEqual({ status: 200 });
			expect(await readRoles(id)).toBe('tesouraria,comunicacao');
		});
	});

	it('hides a user who belongs only to Comunicação', async () => {
		await withUsers(['comunicacao'], async ([id]) => {
			await expect(invoke(editLoad, editEvent(id))).rejects.toMatchObject({ status: 404 });
		});
	});
});

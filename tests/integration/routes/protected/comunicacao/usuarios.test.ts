import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createTestUsername, withUsers } from '../../../lib/server/models/user-test-support';
import type { TestUser } from '../../../support/request-event';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { load as listLoad } from '../../../../../src/routes/(protected)/comunicacao/usuarios/+page.server';
import { actions as createActions } from '../../../../../src/routes/(protected)/comunicacao/usuarios/novo/+page.server';
import { actions as editActions } from '../../../../../src/routes/(protected)/comunicacao/usuarios/[id=alphanumeric]/+page.server';

const coordinator: TestUser = {
	id: 'integration-comunicacao',
	username: 'comunicacao',
	name: 'Comunicação',
	roles: 'comunicacao:admin',
};

const actionEvent = (entries: Record<string, string>, params: Record<string, string> = {}) => {
	const form = new FormData();
	Object.entries(entries).forEach(([key, value]) => form.set(key, value));

	return createRequestEvent({
		locals: { user: coordinator, session: null },
		params,
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

const readRoles = async (column: 'id' | 'username', value: string) => {
	const [stored] = await db.select({ id: user.id, roles: user.roles }).from(user).where(eq(user[column], value));

	return stored;
};

const accountForm = (roles: string) => ({
	username: createTestUsername(),
	password: 'senha-segura',
	name: 'Teste',
	roles,
});

describe('TI-18 Comunicação user routes', () => {
	it('lists a user whose Comunicação role is not the first one', async () => {
		await withUsers(['tesouraria,comunicacao'], async ([id]) => {
			const [stored] = await db.select({ name: user.name }).from(user).where(eq(user.id, id));
			const url = new URL(`http://localhost/comunicacao/usuarios?nome=${stored.name}`);
			const event = createRequestEvent({ locals: { user: coordinator, session: null }, url });

			const loaded = (await invoke(listLoad, event)) as { usuarios: Promise<{ id: string }[]> };

			expect(await loaded.usuarios).toEqual([{ id, name: stored.name }]);
		});
	});

	it('creates a volunteer', async () => {
		const form = accountForm('comunicacao');

		const result = await invoke(createActions.default, actionEvent(form));
		const stored = await readRoles('username', form.username);

		try {
			expect(result).toEqual({ status: 201 });
			expect(stored?.roles).toBe('comunicacao');
		} finally {
			if (stored) await db.delete(user).where(eq(user.id, stored.id));
		}
	});

	it('promotes a user to coordination keeping the Tesouraria role', async () => {
		await withUsers(['tesouraria,comunicacao'], async ([id]) => {
			const result = await invoke(editActions.default, actionEvent(accountForm('comunicacao:admin'), { id }));

			expect(result).toEqual({ status: 200 });
			expect((await readRoles('id', id))?.roles).toBe('comunicacao:admin,tesouraria');
		});
	});
});

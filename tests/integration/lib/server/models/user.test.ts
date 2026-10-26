import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { COMUNICACAO_AREA, SECRETARIA_AREA } from '#lib/server/users/area-roles.js';
import { DuplicateUsernameError } from '#lib/server/models/user-error.js';
import { UserModel } from '#lib/server/models/user.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createTestUserValues, withUsers } from './user-test-support';

const model = new UserModel(db);
const LONGEST_COORDINATION_ROLES = 'biblioteca:admin,secretaria:admin,tesouraria:admin,comunicacao:admin';

const listIds = async (areaRoles: readonly string[]) =>
	(await model.listByAreaRoles(areaRoles, { name: '0teste-', page: 1 })).map(({ id }) => id);

describe('TI-16 UserModel.listByAreaRoles', () => {
	it('lists a user whose area role is not the first one', async () => {
		await withUsers(['tesouraria,comunicacao'], async ([id]) => {
			expect(await listIds(COMUNICACAO_AREA.areaRoles)).toContain(id);
		});
	});

	it('lists the area users when no name is searched', async () => {
		await withUsers(['comunicacao'], async ([id]) => {
			const users = await model.listByAreaRoles(COMUNICACAO_AREA.areaRoles, { page: 1 });

			expect(users.map((listed) => listed.id)).toContain(id);
		});
	});

	it('leaves a user of another area out of the listing', async () => {
		await withUsers(['comunicacao'], async ([id]) => {
			expect(await listIds(SECRETARIA_AREA.areaRoles)).not.toContain(id);
		});
	});
});

describe('TI-17 User.roles', () => {
	it('stores the longest combination of coordination roles', async () => {
		await withUsers([LONGEST_COORDINATION_ROLES], async ([id]) => {
			expect(await model.get(id)).toMatchObject({ roles: LONGEST_COORDINATION_ROLES });
		});
	});
});

describe('UserModel writes', () => {
	it('creates a user and updates its data', async () => {
		const values = createTestUserValues('comunicacao');

		try {
			await model.create(values);

			const updated = await model.update(values.id, { ...values, name: `${values.name}-novo`, roles: undefined });

			expect(updated).toBe(true);
			expect(await model.get(values.id)).toMatchObject({ name: `${values.name}-novo`, roles: 'comunicacao' });
		} finally {
			await db.delete(user).where(eq(user.id, values.id));
		}
	});

	it('reports when the updated user does not exist', async () => {
		const { username, name, passwordHash } = createTestUserValues('comunicacao');

		expect(await model.update('inexistente', { username, name, passwordHash })).toBe(false);
	});

	it('translates a duplicate login on creation', async () => {
		await withUsers(['comunicacao'], async ([id]) => {
			const existing = await model.get(id);
			const duplicate = { ...createTestUserValues('comunicacao'), username: existing?.username ?? '' };

			await expect(model.create(duplicate)).rejects.toBeInstanceOf(DuplicateUsernameError);
		});
	});

	it('translates a duplicate login on update', async () => {
		await withUsers(['comunicacao', 'comunicacao'], async ([firstId, secondId]) => {
			const first = await model.get(firstId);
			const { name, passwordHash } = createTestUserValues('comunicacao');

			const update = model.update(secondId, { username: first?.username ?? '', name, passwordHash });

			await expect(update).rejects.toThrow('Já existe um usuário com este login.');
		});
	});
});

describe('UserModel.findCredentials', () => {
	it('returns the login credentials of the user with the given login', async () => {
		await withUsers(['comunicacao'], async ([id]) => {
			const { username } = (await model.get(id)) ?? { username: '' };

			expect(await model.findCredentials(username)).toEqual({
				id,
				passwordHash: 'hash-de-teste',
				roles: 'comunicacao',
			});
		});
	});

	it('finds nobody for an unknown login', async () => {
		expect(await model.findCredentials('ninguem@teste.com')).toBeUndefined();
	});
});

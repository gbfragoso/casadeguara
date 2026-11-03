import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { DuplicateUsernameError } from '#lib/server/models/user-error.js';
import { UserModel } from '#lib/server/models/user.js';
import { eq, inArray } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { createTestUserValues, withUsers } from './user-test-support';

const model = new UserModel(db);
const LONGEST_SAVED_ROLES = 'biblioteca:admin,secretaria:admin,tesouraria:admin,comunicacao:admin,superuser';

describe('TI-14 User.roles', () => {
	it('stores the longest combination saved by the user management screen', async () => {
		await withUsers([LONGEST_SAVED_ROLES], async ([id]) => {
			expect(await model.get(id)).toMatchObject({ roles: LONGEST_SAVED_ROLES });
		});
	});
});

describe('TI-03 UserModel.listAll', () => {
	it('lists every user, including those without roles, by unaccented name and then by id', async () => {
		const suffix = createTestUserValues('').name;
		const bruna = { ...createTestUserValues(''), name: `Bruna ${suffix}` };
		const [firstAlvaro, secondAlvaro] = [createTestUserValues('superuser'), createTestUserValues('secretaria')]
			.map((values) => ({ ...values, name: `Álvaro ${suffix}` }))
			.toSorted((first, second) => (first.id < second.id ? -1 : 1));
		const inserted = [bruna, secondAlvaro, firstAlvaro];
		await db.insert(user).values(inserted);

		try {
			const listed = await model.listAll();

			const ours = listed.filter(({ name }) => name.endsWith(suffix));
			expect(ours).toEqual(
				[firstAlvaro, secondAlvaro, bruna].map(({ id, username, name, roles }) => ({
					id,
					username,
					name,
					roles,
				})),
			);
		} finally {
			await db.delete(user).where(
				inArray(
					user.id,
					inserted.map(({ id }) => id),
				),
			);
		}
	});
});

describe('UserModel writes', () => {
	it('creates a user and updates its data', async () => {
		const values = createTestUserValues('comunicacao');

		try {
			await model.create(values);

			const updated = await model.update(values.id, {
				...values,
				name: `${values.name}-novo`,
				roles: 'superuser',
			});

			expect(updated).toBe(true);
			expect(await model.get(values.id)).toMatchObject({ name: `${values.name}-novo`, roles: 'superuser' });
		} finally {
			await db.delete(user).where(eq(user.id, values.id));
		}
	});

	it('keeps the current password hash when no new hash is given', async () => {
		await withUsers(['comunicacao'], async ([id]) => {
			const { username, name } = createTestUserValues('');

			await model.update(id, { username, name, roles: 'secretaria' });

			expect(await model.findCredentials(username)).toEqual({
				id,
				passwordHash: 'hash-de-teste',
				roles: 'secretaria',
			});
		});
	});

	it('reports when the updated user does not exist', async () => {
		const { username, name, passwordHash, roles } = createTestUserValues('comunicacao');

		expect(await model.update('inexistente', { username, name, passwordHash, roles })).toBe(false);
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
			const { name, roles } = createTestUserValues('comunicacao');

			const update = model.update(secondId, { username: first?.username ?? '', name, roles });

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

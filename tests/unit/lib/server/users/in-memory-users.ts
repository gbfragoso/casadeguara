import type { NewUser, UserChanges } from '#lib/server/models/user.js';

type StoredUser = Omit<NewUser, 'passwordHash'> & { passwordHash?: string };

export const createInMemoryUsers = (initial: StoredUser[] = []) => {
	const stored = new Map(initial.map((user) => [user.id, { ...user }]));

	return {
		find: (id: string) => stored.get(id),
		get: async (id: string) => {
			const found = stored.get(id);
			return found && { id: found.id, username: found.username, name: found.name, roles: found.roles };
		},
		create: async (values: NewUser) => {
			stored.set(values.id, { ...values });
		},
		update: async (id: string, changes: UserChanges) => {
			const current = stored.get(id);
			if (!current) return false;
			stored.set(id, { ...current, ...changes, roles: changes.roles ?? current.roles });
			return true;
		},
	};
};

export type InMemoryUsers = ReturnType<typeof createInMemoryUsers>;

import type { NewUser, UserChanges, UserListFilter } from '#lib/server/models/user.js';

type StoredUser = Omit<NewUser, 'passwordHash'> & { passwordHash?: string };

export const createInMemoryUsers = (initial: StoredUser[] = []) => {
	const stored = new Map(initial.map((user) => [user.id, { ...user }]));
	const listings: { areaRoles: readonly string[]; filter: UserListFilter }[] = [];

	return {
		listings,
		find: (id: string) => stored.get(id),
		listByAreaRoles: async (areaRoles: readonly string[], filter: UserListFilter) => {
			listings.push({ areaRoles, filter });
			return [...stored.values()].map(({ id, name }) => ({ id, name }));
		},
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

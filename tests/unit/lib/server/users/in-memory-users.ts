import type { NewUser, UserChanges } from '#lib/server/models/user.js';

type StoredUser = Omit<NewUser, 'passwordHash'> & { passwordHash?: string };

const toListedUser = ({ id, username, name, roles }: StoredUser) => ({ id, username, name, roles });

export const createInMemoryUsers = (initial: StoredUser[] = []) => {
	const stored = new Map(initial.map((user) => [user.id, { ...user }]));

	return {
		find: (id: string) => stored.get(id),
		listAll: async () => [...stored.values()].map(toListedUser),
		get: async (id: string) => {
			const found = stored.get(id);
			return found && toListedUser(found);
		},
		create: async (values: NewUser) => {
			stored.set(values.id, { ...values });
		},
		update: async (id: string, changes: UserChanges) => {
			const current = stored.get(id);
			if (!current) return false;
			stored.set(id, { ...current, ...changes });
			return true;
		},
	};
};

export type InMemoryUsers = ReturnType<typeof createInMemoryUsers>;

import { db } from '#lib/server/database/connection.js';
import { rolesOverlap, ulike, unaccent } from '#lib/server/database/functions.js';
import { user } from '#lib/server/database/schema.js';
import { translateUserError } from '#lib/server/models/user-error.js';
import { and, eq } from 'drizzle-orm';

export const USER_LIST_PAGE_SIZE = 5;

const listedUserFields = { id: user.id, name: user.name };
const editableUserFields = { id: user.id, username: user.username, name: user.name, roles: user.roles };
const credentialFields = { id: user.id, passwordHash: user.passwordHash, roles: user.roles };

export type UserListFilter = { name?: string; page: number };
export type NewUser = { id: string; username: string; name: string; passwordHash: string; roles: string };
export type UserChanges = Omit<NewUser, 'id' | 'roles'> & { roles?: string };

export class UserModel {
	constructor(private readonly database: typeof db = db) {}

	listByAreaRoles(areaRoles: readonly string[], { name, page }: UserListFilter) {
		const nameFilter = name ? ulike(user.name, `${name}%`) : undefined;

		return this.database
			.select(listedUserFields)
			.from(user)
			.where(and(nameFilter, rolesOverlap(user.roles, areaRoles)))
			.orderBy(unaccent(user.name))
			.offset((page - 1) * USER_LIST_PAGE_SIZE);
	}

	async get(id: string) {
		const found = await this.database.select(editableUserFields).from(user).where(eq(user.id, id));

		return found.at(0);
	}

	async findCredentials(username: string) {
		const found = await this.database.select(credentialFields).from(user).where(eq(user.username, username));

		return found.at(0);
	}

	async create(values: NewUser) {
		await this.database.insert(user).values(values).catch(translateUserError);
	}

	async update(id: string, changes: UserChanges) {
		const updated = await this.database
			.update(user)
			.set(changes)
			.where(eq(user.id, id))
			.returning({ id: user.id })
			.catch(translateUserError);

		return updated.length > 0;
	}
}

export const userModel = new UserModel();

import { db } from '#lib/server/database/connection.js';
import { user } from '#lib/server/database/schema.js';
import { translateUserError } from '#lib/server/models/user-error.js';
import { eq } from 'drizzle-orm';

const editableUserFields = { id: user.id, username: user.username, name: user.name, roles: user.roles };
const credentialFields = { id: user.id, passwordHash: user.passwordHash, roles: user.roles };

export type NewUser = { id: string; username: string; name: string; passwordHash: string; roles: string };
export type UserChanges = Omit<NewUser, 'id' | 'roles'> & { roles?: string };

export class UserModel {
	constructor(private readonly database: typeof db = db) {}

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

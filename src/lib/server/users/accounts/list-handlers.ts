import { requireSuperuserAccess } from '#lib/server/authorization/superuser.js';
import type { ListedUser, UserModel } from '#lib/server/models/user.js';
import { summarizeAccess } from '#lib/server/users/roles.js';
import { error } from '@sveltejs/kit';

type User = { roles: string } | null;
type LoadContext = { locals: { user: User } };

export type ListedUserAccount = { id: string; name: string; username: string; accessSummary: string };

const toListedAccount = ({ id, name, username, roles }: ListedUser): ListedUserAccount => ({
	id,
	name,
	username,
	accessSummary: summarizeAccess(roles),
});

export const createUserListHandlers = ({ users }: { users: Pick<UserModel, 'listAll'> }) => ({
	load: async ({ locals }: LoadContext) => {
		requireSuperuserAccess(locals.user);

		try {
			const listed = await users.listAll();
			return { usuarios: listed.map(toListedAccount) };
		} catch (cause) {
			console.error(cause);
			error(500, 'Falha ao baixar a lista de usuários');
		}
	},
});

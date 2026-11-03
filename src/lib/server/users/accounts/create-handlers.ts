import { generateUserId } from '#lib/server/auth/user-id.js';
import { requireSuperuserAccess } from '#lib/server/authorization/superuser.js';
import type { UserModel } from '#lib/server/models/user.js';
import { parseUserAccountForm, readUserAccountValues } from '#lib/server/users/accounts/account-form.js';
import { buildRoles } from '#lib/server/users/roles.js';
import { saveUserAccount } from '#lib/server/users/user-save.js';
import { fail } from '@sveltejs/kit';

const CREATED_STATUS = 201;

type User = { roles: string } | null;
type LoadContext = { locals: { user: User } };
type ActionContext = LoadContext & { request: Request };
type CreateDependencies = {
	users: Pick<UserModel, 'create'>;
	hashPassword: (password: string) => Promise<string>;
};

export const createUserCreateHandlers = ({ users, hashPassword }: CreateDependencies) => ({
	load: ({ locals }: LoadContext) => {
		requireSuperuserAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireSuperuserAccess(locals.user);

			const formData = await request.formData();
			const parsed = parseUserAccountForm(formData, 'create');
			if (!parsed.success) return fail(400, parsed.failure);

			const { username, name, password, access } = parsed.data;
			const passwordHash = await hashPassword(password);
			return saveUserAccount({
				save: () =>
					users.create({ id: generateUserId(), username, name, passwordHash, roles: buildRoles(access) }),
				successStatus: CREATED_STATUS,
				failureMessage: 'Falha ao criar um novo usuário',
				values: readUserAccountValues(formData),
			});
		},
	},
});

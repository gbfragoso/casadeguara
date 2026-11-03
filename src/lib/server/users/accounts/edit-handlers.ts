import { requireSuperuserAccess } from '#lib/server/authorization/superuser.js';
import type { UserModel } from '#lib/server/models/user.js';
import {
	parseUserAccountForm,
	readUserAccountValues,
	type UserAccountValues,
} from '#lib/server/users/accounts/account-form.js';
import { buildRoles, readUserAccess, type UserAccess } from '#lib/server/users/roles.js';
import { saveUserAccount } from '#lib/server/users/user-save.js';
import { error, fail } from '@sveltejs/kit';

const UPDATED_STATUS = 200;
const SELF_SUPERUSER_MESSAGE = 'Você não pode retirar a sua própria role de superusuário.';

type EditModel = Pick<UserModel, 'get' | 'update'>;
type EditDependencies = { users: EditModel; hashPassword: (password: string) => Promise<string> };
type User = { id: string; roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

export type EditableUserAccount = { id: string; username: string; name: string; access: UserAccess };

const findUser = async (users: EditModel, id: string) => {
	let found;
	try {
		found = await users.get(id);
	} catch (cause) {
		console.error(cause);
		error(500, 'Falha ao baixar os dados do usuário');
	}
	if (!found) error(404, 'Usuário não encontrado');

	return found;
};

const rejectSelfSuperuserRemoval = (values: UserAccountValues) =>
	fail(400, { values, errors: { superuser: [SELF_SUPERUSER_MESSAGE] } });

const hashNewPassword = async (hashPassword: EditDependencies['hashPassword'], password: string | undefined) =>
	password ? { passwordHash: await hashPassword(password) } : {};

export const createUserEditHandlers = ({ users, hashPassword }: EditDependencies) => ({
	load: async ({ locals, params }: LoadContext) => {
		requireSuperuserAccess(locals.user);

		const { id, username, name, roles } = await findUser(users, params.id);
		const usuario: EditableUserAccount = { id, username, name, access: readUserAccess(roles) };
		return { usuario };
	},
	actions: {
		default: async ({ locals, params, request }: ActionContext) => {
			const editor = requireSuperuserAccess(locals.user);

			const formData = await request.formData();
			const parsed = parseUserAccountForm(formData, 'edit');
			if (!parsed.success) return fail(400, parsed.failure);

			const { username, name, password, access } = parsed.data;
			const values = readUserAccountValues(formData);
			const target = await findUser(users, params.id);
			if (editor.id === target.id && !access.superuser) return rejectSelfSuperuserRemoval(values);

			const roles = buildRoles(access, target.roles);
			const changes = { username, name, roles, ...(await hashNewPassword(hashPassword, password)) };
			return saveUserAccount({
				save: () => users.update(target.id, changes),
				successStatus: UPDATED_STATUS,
				failureMessage: 'Falha ao atualizar os dados do usuário',
				values,
			});
		},
	},
});

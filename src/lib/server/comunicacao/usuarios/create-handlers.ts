import { generateUserId } from '#lib/server/auth/user-id.js';
import { requireComunicacaoAdminAccess } from '#lib/server/authorization/comunicacao.js';
import type { UserModel } from '#lib/server/models/user.js';
import { COMUNICACAO_AREA } from '#lib/server/users/area-roles.js';
import { readUserForm, validateUserForm } from '#lib/server/users/user-form.js';
import { saveUserAccount } from '#lib/server/users/user-save.js';
import { hash } from 'argon2';

const CREATED_STATUS = 201;

type User = { roles: string } | null;
type LoadContext = { locals: { user: User } };
type ActionContext = LoadContext & { request: Request };

export const createComunicacaoUserCreateHandlers = ({ users }: { users: Pick<UserModel, 'create'> }) => ({
	load: ({ locals }: LoadContext) => {
		requireComunicacaoAdminAccess(locals.user);
	},
	actions: {
		default: async ({ locals, request }: ActionContext) => {
			requireComunicacaoAdminAccess(locals.user);

			const form = await readUserForm(request);
			const rejection = validateUserForm(form, { area: COMUNICACAO_AREA, requireRoles: true });
			if (rejection) return rejection;

			const { username, name, password, roles } = form;
			const passwordHash = await hash(password);
			return saveUserAccount(
				() => users.create({ id: generateUserId(), username, name, passwordHash, roles }),
				CREATED_STATUS,
				'Falha ao criar um novo usuário',
			);
		},
	},
});

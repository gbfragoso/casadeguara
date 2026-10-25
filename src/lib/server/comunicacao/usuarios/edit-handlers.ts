import { requireComunicacaoAdminAccess } from '#lib/server/authorization/comunicacao.js';
import type { UserModel } from '#lib/server/models/user.js';
import { COMUNICACAO_AREA } from '#lib/server/users/area-roles.js';
import { readUserForm, validateUserForm } from '#lib/server/users/user-form.js';
import { saveUserAccount } from '#lib/server/users/user-save.js';
import { error } from '@sveltejs/kit';
import { hash } from 'argon2';

const UPDATED_STATUS = 200;

type EditModel = Pick<UserModel, 'get' | 'update'>;
type User = { roles: string } | null;
type LoadContext = { locals: { user: User }; params: { id: string } };
type ActionContext = LoadContext & { request: Request };

const readUser = async (users: EditModel, id: string) => {
	try {
		return await users.get(id);
	} catch (cause) {
		console.error(cause);
		error(500, 'Falha ao baixar os dados do usuário');
	}
};

const findEditableUser = async (users: EditModel, id: string, editor: { roles: string }) => {
	const target = await readUser(users, id);
	if (!target || !COMUNICACAO_AREA.includesAny(target.roles)) error(404, 'Usuário não encontrado');
	if (!COMUNICACAO_AREA.administersOtherAreasOf(editor, target)) {
		error(403, 'Usuário não possui acesso administrativo às demais áreas deste usuário');
	}

	return target;
};

export const createComunicacaoUserEditHandlers = ({ users }: { users: EditModel }) => ({
	load: async ({ locals, params }: LoadContext) => {
		const editor = requireComunicacaoAdminAccess(locals.user);

		const target = await findEditableUser(users, params.id, editor);

		return { usuario: { ...target, roles: COMUNICACAO_AREA.select(target.roles) } };
	},
	actions: {
		default: async ({ locals, params, request }: ActionContext) => {
			const editor = requireComunicacaoAdminAccess(locals.user);

			const form = await readUserForm(request);
			const rejection = validateUserForm(form, { area: COMUNICACAO_AREA, requireRoles: false });
			if (rejection) return rejection;

			const target = await findEditableUser(users, params.id, editor);
			const roles = form.roles ? COMUNICACAO_AREA.replace(target.roles, form.roles) : undefined;
			const passwordHash = await hash(form.password);
			const changes = { username: form.username, name: form.name, passwordHash, roles };
			return saveUserAccount(
				() => users.update(params.id, changes),
				UPDATED_STATUS,
				'Falha ao atualizar os dados do usuário',
			);
		},
	},
});

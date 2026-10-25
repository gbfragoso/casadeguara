import { requireComunicacaoAdminAccess } from '#lib/server/authorization/comunicacao.js';
import type { UserListFilter } from '#lib/server/models/user.js';
import { COMUNICACAO_AREA } from '#lib/server/users/area-roles.js';

type ListedUser = { id: string; name: string };
type UserListModel = {
	listByAreaRoles(areaRoles: readonly string[], filter: UserListFilter): PromiseLike<ListedUser[]>;
};
type User = { roles: string } | null;
type LoadContext = { locals: { user: User }; url: URL };

export const createComunicacaoUserListHandlers = ({ users }: { users: UserListModel }) => {
	const listUsers = async (filter: UserListFilter) => users.listByAreaRoles(COMUNICACAO_AREA.areaRoles, filter);

	return {
		load: ({ locals, url }: LoadContext) => {
			requireComunicacaoAdminAccess(locals.user);

			const page = Number(url.searchParams.get('page') || 1);
			const name = url.searchParams.get('nome') || undefined;

			return { usuarios: listUsers({ name, page }) };
		},
	};
};

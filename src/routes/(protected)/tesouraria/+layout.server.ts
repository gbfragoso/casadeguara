import { hasTesourariaAdminAccess, requireTesourariaAccess } from '#lib/server/authorization/tesouraria.js';
import { hasSuperuserAccess } from '#lib/server/authorization/superuser.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const user = requireTesourariaAccess(locals.user);
	return {
		username: user.name,
		userid: user.id,
		isAdmin: hasTesourariaAdminAccess(user),
		canManageUsers: hasSuperuserAccess(user),
	};
};

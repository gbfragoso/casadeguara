import { hasComunicacaoAdminAccess, requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const user = requireComunicacaoAccess(locals.user);
	return {
		username: user.name,
		userid: user.id,
		isAdmin: hasComunicacaoAdminAccess(user),
	};
};

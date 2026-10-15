import { hasTesourariaAccess } from '#lib/server/authorization/tesouraria.js';
import { error, redirect } from '@sveltejs/kit';

type TesourariaUser = { id: string; roles: string } | null | undefined;

export const requireTesourariaAccess = (user: TesourariaUser) => {
	if (!user) redirect(302, '/');
	if (!hasTesourariaAccess(user)) {
		error(401, 'Usuário não possui acesso ao sistema da tesouraria.');
	}

	return user;
};

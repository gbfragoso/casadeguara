import { hasTesourariaAccess } from '$lib/server/authorization/cadastros';
import { error, redirect } from '@sveltejs/kit';

type TesourariaUser = { id: string; roles: string } | null | undefined;

export const requireTesourariaAccess = (user: TesourariaUser) => {
	if (!user) redirect(302, '/');
	if (!hasTesourariaAccess(user)) {
		error(401, { message: 'Usuário não possui acesso ao sistema da tesouraria.' });
	}

	return user;
};

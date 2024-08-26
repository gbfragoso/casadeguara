import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user?.roles.includes('secretaria'))
		error(401, {
			message: 'Usuário não possui acesso ao sistema da secretaria',
		});

	const name = {
		name: locals.user.name,
	};
	return name;
};

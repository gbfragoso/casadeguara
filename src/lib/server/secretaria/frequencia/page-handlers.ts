import type { RequestEvent } from '@sveltejs/kit';

import { requireSecretariaAccess } from '#lib/server/secretaria/access.js';

const load = async ({ locals }: RequestEvent) => {
	requireSecretariaAccess(locals.user);
};

export const createSecretariaFrequenciaHandlers = () => ({ load });

import { createLoginHandlers } from '$lib/server/public/login-handlers';

import type { Actions } from './$types';

const handlers = createLoginHandlers();
export const actions: Actions = handlers.actions;

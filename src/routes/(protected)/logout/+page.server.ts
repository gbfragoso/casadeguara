import { createLogoutHandlers } from '$lib/server/auth/logout-handlers';

import type { Actions } from './$types';

const handlers = createLogoutHandlers();
export const actions: Actions = handlers.actions;

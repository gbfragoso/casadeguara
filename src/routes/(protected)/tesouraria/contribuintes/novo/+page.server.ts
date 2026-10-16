import { cadastroModel } from '#lib/server/models/cadastro.js';
import { createContributorCreateHandlers } from '#lib/server/tesouraria/contribuintes/create-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createContributorCreateHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

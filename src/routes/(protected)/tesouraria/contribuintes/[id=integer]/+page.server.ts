import { cadastroModel } from '#lib/server/models/cadastro.js';
import { createContributorEditHandlers } from '#lib/server/tesouraria/contribuintes/edit-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createContributorEditHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

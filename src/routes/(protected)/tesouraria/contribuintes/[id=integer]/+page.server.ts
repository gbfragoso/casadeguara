import { cadastroModel } from '$lib/server/models/cadastro';
import { createContributorEditHandlers } from '$lib/server/tesouraria/contribuintes/edit-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createContributorEditHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

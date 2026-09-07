import { cadastroModel } from '$lib/server/models/cadastro';
import { createContributorListHandlers } from '$lib/server/tesouraria/contribuintes/list-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createContributorListHandlers({ model: cadastroModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

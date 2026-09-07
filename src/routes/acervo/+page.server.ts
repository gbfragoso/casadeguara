import { createAcervoHandlers } from '$lib/server/acervo/search-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createAcervoHandlers();
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

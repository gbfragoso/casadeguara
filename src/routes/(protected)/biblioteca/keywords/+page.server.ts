import { keywordModel } from '$lib/server/models/keyword';
import { createKeywordListHandlers } from '$lib/server/biblioteca/keywords/list-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createKeywordListHandlers({ model: keywordModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

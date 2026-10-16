import { keywordModel } from '#lib/server/models/keyword.js';
import { createKeywordCreateHandlers } from '#lib/server/biblioteca/keywords/create-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createKeywordCreateHandlers({ model: keywordModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

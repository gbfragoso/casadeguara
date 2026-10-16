import { keywordModel } from '#lib/server/models/keyword.js';
import { createKeywordEditHandlers } from '#lib/server/biblioteca/keywords/edit-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createKeywordEditHandlers({ model: keywordModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

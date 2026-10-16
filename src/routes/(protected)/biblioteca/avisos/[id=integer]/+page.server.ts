import { avisoModel } from '#lib/server/models/aviso.js';
import { createNoticeEditHandlers } from '#lib/server/biblioteca/avisos/edit-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createNoticeEditHandlers({ model: avisoModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

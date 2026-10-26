import { createSpeakerEditHandlers } from '#lib/server/comunicacao/palestrantes/edit.js';
import { palestranteModel } from '#lib/server/models/palestrante.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSpeakerEditHandlers({ speakers: palestranteModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

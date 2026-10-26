import { createSpeakerCreateHandlers } from '#lib/server/comunicacao/palestrantes/create.js';
import { palestranteModel } from '#lib/server/models/palestrante.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSpeakerCreateHandlers({ speakers: palestranteModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

import { createSpeakerImportHandlers } from '#lib/server/comunicacao/palestrantes/import.js';
import { palestranteModel } from '#lib/server/models/palestrante.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSpeakerImportHandlers({ speakers: palestranteModel });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

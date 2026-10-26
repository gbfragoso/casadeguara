import { createSpeakerListLoad } from '#lib/server/comunicacao/palestrantes/list.js';
import { palestranteModel } from '#lib/server/models/palestrante.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = createSpeakerListLoad({ speakers: palestranteModel });

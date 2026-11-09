import { palestraModel } from '#lib/server/models/palestra.js';
import { createTalksPageLoad } from '#lib/server/public/talks-page-handlers.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = createTalksPageLoad({ talks: palestraModel, clock: () => new Date() });

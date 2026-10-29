import { palestraModel } from '#lib/server/models/palestra.js';
import { createHomeLoad } from '#lib/server/public/home-handlers.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = createHomeLoad({ talks: palestraModel, clock: () => new Date() });

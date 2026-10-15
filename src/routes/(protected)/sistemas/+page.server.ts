import { createSistemasHandlers } from '#lib/server/sistemas/root/page-handlers.js';

import type { PageServerLoad } from './$types';

const handlers = createSistemasHandlers();
export const load: PageServerLoad = handlers.load;

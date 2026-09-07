import { createSistemasHandlers } from '$lib/server/sistemas/root/page-handlers';

import type { PageServerLoad } from './$types';

const handlers = createSistemasHandlers();
export const load: PageServerLoad = handlers.load;

import { createBibliotecaHandlers } from '#lib/server/biblioteca/root/page-handlers.js';

import type { PageServerLoad } from './$types';

const handlers = createBibliotecaHandlers();
export const load: PageServerLoad = handlers.load;

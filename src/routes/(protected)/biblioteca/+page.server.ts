import { createBibliotecaHandlers } from '$lib/server/biblioteca/root/page-handlers';

import type { PageServerLoad } from './$types';

const handlers = createBibliotecaHandlers();
export const load: PageServerLoad = handlers.load;

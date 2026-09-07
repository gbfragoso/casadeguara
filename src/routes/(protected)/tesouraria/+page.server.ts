import { createTesourariaHandlers } from '$lib/server/tesouraria/root/page-handlers';

import type { PageServerLoad } from './$types';

const handlers = createTesourariaHandlers();
export const load: PageServerLoad = handlers.load;

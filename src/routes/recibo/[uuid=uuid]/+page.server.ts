import { createReceiptHandlers } from '$lib/server/public/receipt-handlers';

import type { PageServerLoad } from './$types';

const handlers = createReceiptHandlers();
export const load: PageServerLoad = handlers.load;

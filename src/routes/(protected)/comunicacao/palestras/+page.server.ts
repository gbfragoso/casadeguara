import { createTalkBoardHandlers } from '#lib/server/comunicacao/palestras/page-handlers.js';
import { palestraModel } from '#lib/server/models/palestra.js';
import { palestranteModel } from '#lib/server/models/palestrante.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createTalkBoardHandlers({
	talks: palestraModel,
	speakers: palestranteModel,
	today: () => readBahiaIsoDate(new Date()),
});
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

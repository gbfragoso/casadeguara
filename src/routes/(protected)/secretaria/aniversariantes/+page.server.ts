import { cadastroModel } from '#lib/server/models/cadastro.js';
import { createSecretariaAniversariantesHandlers } from '#lib/server/secretaria/aniversariantes/page-handlers.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSecretariaAniversariantesHandlers({
	birthdays: cadastroModel,
	today: () => readBahiaIsoDate(new Date()),
});
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

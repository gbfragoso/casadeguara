import { createBirthdayPdfHandler } from '#lib/server/secretaria/aniversariantes/pdf-handler.js';
import { cadastroModel } from '#lib/server/models/cadastro.js';
import { generateBirthdayListPdf } from '#lib/server/pdf/birthday-list/generator.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createBirthdayPdfHandler({
	birthdays: cadastroModel,
	generateList: generateBirthdayListPdf,
	today: () => readBahiaIsoDate(new Date()),
});

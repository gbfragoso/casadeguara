import { cadastroModel } from '#lib/server/models/cadastro.js';
import { generateAttendanceListPdf } from '#lib/server/pdf/attendance-list/generator.js';
import { createAttendancePdfHandler } from '#lib/server/secretaria/frequencia/pdf-handler.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createAttendancePdfHandler({
	workers: cadastroModel,
	generateList: generateAttendanceListPdf,
	today: () => readBahiaIsoDate(new Date()),
});

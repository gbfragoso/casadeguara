import { createTalkProgramHandler } from '#lib/server/comunicacao/palestras/program-handler.js';
import { palestraModel } from '#lib/server/models/palestra.js';
import { generateTalkProgramPdf } from '#lib/server/pdf/talk-program/generator.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createTalkProgramHandler({
	talks: palestraModel,
	generateProgram: generateTalkProgramPdf,
	today: () => readBahiaIsoDate(new Date()),
});

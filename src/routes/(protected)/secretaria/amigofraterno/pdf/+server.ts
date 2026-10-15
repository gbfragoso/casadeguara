import { generateAmigoFraternoPdf } from '#lib/server/pdf/amigo-fraterno/generator.js';
import { amigoFraternoParticipants } from '#lib/server/pdf/amigo-fraterno/participants.js';
import { createPdfHandler } from '#lib/server/pdf/amigo-fraterno/handler.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createPdfHandler(amigoFraternoParticipants, generateAmigoFraternoPdf);

import { generateAmigoFraternoPdf } from '$lib/server/pdf/amigo-fraterno/generator';
import { amigoFraternoParticipants } from '$lib/server/pdf/amigo-fraterno/participants';
import { createPdfHandler } from '$lib/server/pdf/amigo-fraterno/handler';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createPdfHandler(amigoFraternoParticipants, generateAmigoFraternoPdf);

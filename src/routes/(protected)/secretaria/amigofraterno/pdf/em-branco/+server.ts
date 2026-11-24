import { generateBlankAmigoFraternoPdf } from '#lib/server/pdf/amigo-fraterno/generator.js';
import { createBlankPdfHandler } from '#lib/server/pdf/amigo-fraterno/handler.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createBlankPdfHandler(generateBlankAmigoFraternoPdf);

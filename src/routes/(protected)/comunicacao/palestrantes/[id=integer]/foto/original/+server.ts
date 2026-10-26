import { createSpeakerPhotoHandler } from '#lib/server/comunicacao/palestrantes/photo-handler.js';
import { palestranteModel } from '#lib/server/models/palestrante.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createSpeakerPhotoHandler({ speakers: palestranteModel }, 'original');

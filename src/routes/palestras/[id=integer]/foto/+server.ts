import { palestraModel } from '#lib/server/models/palestra.js';
import { createTalkPhotoHandler } from '#lib/server/public/talk-photo-handler.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createTalkPhotoHandler({ talks: palestraModel, clock: () => new Date() });

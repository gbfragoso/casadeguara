import { createTalkArtHandler } from '#lib/server/comunicacao/palestras/art-handler.js';
import { generateTalkArt } from '#lib/server/image/talk-art/generator.js';
import { palestraModel } from '#lib/server/models/palestra.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = createTalkArtHandler({ talks: palestraModel, generateArt: generateTalkArt });

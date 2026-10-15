import { secretariaPhotoModel, type SecretariaPhotoModel } from '#lib/server/models/secretaria-photo.js';

import { createPhotoHandler } from '#lib/server/secretaria/photo/handler.js';

import type { RequestHandler } from './$types';

const createInternalPhotoHandler = (model: Pick<SecretariaPhotoModel, 'getCard'>) =>
	createPhotoHandler((id) => model.getCard(id));

export const GET: RequestHandler = createInternalPhotoHandler(secretariaPhotoModel);

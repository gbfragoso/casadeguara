import { secretariaPhotoModel, type SecretariaPhotoModel } from '#lib/server/models/secretaria-photo.js';

import { createPhotoHandler } from '#lib/server/secretaria/photo/handler.js';
import type { RequestHandler } from './$types';

const createInternalOriginalPhotoHandler = (model: Pick<SecretariaPhotoModel, 'getSource'>) =>
	createPhotoHandler((id) => model.getSource(id));

export const GET: RequestHandler = createInternalOriginalPhotoHandler(secretariaPhotoModel);

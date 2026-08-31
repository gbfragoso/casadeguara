import { secretariaPhotoModel, type SecretariaPhotoModel } from '$lib/server/models/secretaria-photo';

import { createPhotoHandler } from '$lib/server/secretaria/photo/handler';
import type { RequestHandler } from './$types';

const createInternalOriginalPhotoHandler = (model: Pick<SecretariaPhotoModel, 'getSource'>) =>
	createPhotoHandler((id) => model.getSource(id));

export const GET: RequestHandler = createInternalOriginalPhotoHandler(secretariaPhotoModel);

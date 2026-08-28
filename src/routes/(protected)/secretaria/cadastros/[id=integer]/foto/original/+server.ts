import { secretariaPhotoModel, type SecretariaPhotoModel } from '$lib/server/models/secretaria-photo';

import { createPhotoHandler } from '$lib/server/secretaria/photo/handler';
import type { RequestHandler } from './$types';

export const _createOriginalPhotoHandler = (model: Pick<SecretariaPhotoModel, 'getSource'>) =>
	createPhotoHandler((id) => model.getSource(id));

export const GET: RequestHandler = _createOriginalPhotoHandler(secretariaPhotoModel);

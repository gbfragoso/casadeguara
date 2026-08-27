import { secretariaPhotoModel, type SecretariaPhotoModel } from '$lib/server/models/secretaria-photo';

import { createPhotoHandler } from '../../photo-handler';

import type { RequestHandler } from './$types';

export const _createPhotoHandler = (model: Pick<SecretariaPhotoModel, 'getCard'>) =>
	createPhotoHandler((id) => model.getCard(id));

export const GET: RequestHandler = _createPhotoHandler(secretariaPhotoModel);

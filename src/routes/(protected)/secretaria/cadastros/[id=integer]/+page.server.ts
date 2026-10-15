import { cadastroModel } from '#lib/server/models/cadastro.js';
import { secretariaPhotoModel } from '#lib/server/models/secretaria-photo.js';
import { createSecretariaRegistrationEditHandlers } from '#lib/server/secretaria/cadastros/edit-handlers.js';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSecretariaRegistrationEditHandlers({ model: cadastroModel, photoModel: secretariaPhotoModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

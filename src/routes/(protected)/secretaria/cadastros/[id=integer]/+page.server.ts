import { cadastroModel } from '$lib/server/models/cadastro';
import { secretariaPhotoModel } from '$lib/server/models/secretaria-photo';
import { createSecretariaRegistrationEditHandlers } from '$lib/server/secretaria/cadastros/edit-handlers';

import type { Actions, PageServerLoad } from './$types';

const handlers = createSecretariaRegistrationEditHandlers({ model: cadastroModel, photoModel: secretariaPhotoModel });

export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

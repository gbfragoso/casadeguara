import { createComunicacaoUserListHandlers } from '#lib/server/comunicacao/usuarios/list-handlers.js';
import { userModel } from '#lib/server/models/user.js';

import type { PageServerLoad } from './$types';

const handlers = createComunicacaoUserListHandlers({ users: userModel });
export const load: PageServerLoad = handlers.load;

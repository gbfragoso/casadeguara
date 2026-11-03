import { userModel } from '#lib/server/models/user.js';
import { createUserListHandlers } from '#lib/server/users/accounts/list-handlers.js';

import type { PageServerLoad } from './$types';

const handlers = createUserListHandlers({ users: userModel });
export const load: PageServerLoad = handlers.load;

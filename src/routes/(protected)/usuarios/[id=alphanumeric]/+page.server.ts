import { userModel } from '#lib/server/models/user.js';
import { createUserEditHandlers } from '#lib/server/users/accounts/edit-handlers.js';
import { hash } from 'argon2';

import type { Actions, PageServerLoad } from './$types';

const handlers = createUserEditHandlers({ users: userModel, hashPassword: hash });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

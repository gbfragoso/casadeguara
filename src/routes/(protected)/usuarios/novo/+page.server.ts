import { userModel } from '#lib/server/models/user.js';
import { createUserCreateHandlers } from '#lib/server/users/accounts/create-handlers.js';
import { hash } from 'argon2';

import type { Actions, PageServerLoad } from './$types';

const handlers = createUserCreateHandlers({ users: userModel, hashPassword: hash });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

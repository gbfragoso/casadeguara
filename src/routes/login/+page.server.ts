import { sessionModel } from '#lib/server/auth/session.js';
import { userModel } from '#lib/server/models/user.js';
import { createLoginHandlers } from '#lib/server/public/login-handlers.js';
import { verify } from 'argon2';

import type { Actions, PageServerLoad } from './$types';

const handlers = createLoginHandlers({ users: userModel, sessions: sessionModel, verifyPassword: verify });
export const load: PageServerLoad = handlers.load;
export const actions: Actions = handlers.actions;

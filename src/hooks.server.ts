import { createSessionHandle } from '#lib/server/auth/handle.js';
import { sessionModel } from '#lib/server/auth/session.js';

export const handle = createSessionHandle({ sessions: sessionModel });

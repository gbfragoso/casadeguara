import { generateSessionToken, sessionModel } from '#lib/server/auth/session.js';
import { db } from '#lib/server/database/connection.js';
import { session } from '#lib/server/database/schema.js';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { withUsers } from '../../../lib/server/models/user-test-support';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { load as comunicacaoLayout } from '../../../../../src/routes/(protected)/comunicacao/+layout.server';
import { actions } from '../../../../../src/routes/(protected)/usuarios/[id=alphanumeric]/+page.server';
import { SUPERUSER, createAccountForm, createPostEvent, readStoredUser, settle } from './support';

describe('TI-08 removal of every access', () => {
	it('empties the roles of the next session validation and the module layout refuses the user', async () => {
		await withUsers(['comunicacao'], async ([id]) => {
			const token = generateSessionToken();
			await sessionModel.create(token, id);
			const { username } = await readStoredUser(id);

			try {
				await invoke(actions.default, createPostEvent(SUPERUSER, createAccountForm({ username }), { id }));
				const { user } = await sessionModel.validate(token);
				const event = createRequestEvent({ locals: { user, session: null } });
				const layout = await settle(() => invoke(comunicacaoLayout, event));

				expect(user?.roles).toBe('');
				expect(layout).toMatchObject({ status: 403 });
			} finally {
				await db.delete(session).where(eq(session.userId, id));
			}
		});
	});
});

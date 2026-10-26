import { describe, expect, it } from 'vitest';

import { load } from '../../../../../src/routes/(protected)/comunicacao/+page.server';
import { expectRedirect } from '../../../support/handler-event';

describe('comunicacao root page', () => {
	it('opens the talk board', async () => {
		const { redirect } = await expectRedirect(load, { roles: 'comunicacao' });

		expect(redirect).toMatchObject({ status: 307, location: '/comunicacao/palestras' });
	});
});

import { describe, expect, it } from 'vitest';

import { bibliotecaSimpleLoads } from '../../../support/biblioteca-route-loads';
import { bibliotecaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';

describe('TI-07 biblioteca page loads', () => {
	it('loads every non-parameterized catalog export for an authorized user', async () => {
		const results = await Promise.all(
			bibliotecaSimpleLoads.map((load) =>
				invoke(load, createRequestEvent({ locals: { user: bibliotecaUser, session: null } })),
			),
		);

		expect(results).toHaveLength(bibliotecaSimpleLoads.length);
	});
});

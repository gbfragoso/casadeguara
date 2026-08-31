import { describe, expect, it } from 'vitest';

import { POST } from '../../../../../src/routes/(protected)/api/cadastros/+server';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { secretariaUser } from '../../../support/auth';

const request = (body: BodyInit) =>
	new Request('http://localhost/api/cadastros', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body,
	});

describe('TI-07 cadastro flag endpoint', () => {
	it('rejects malformed JSON and invalid flag data before persistence', async () => {
		const malformed = await invoke(
			POST,
			createRequestEvent({ locals: { user: secretariaUser, session: null }, request: request('{') }),
		);
		const invalid = await invoke(
			POST,
			createRequestEvent({
				locals: { user: secretariaUser, session: null },
				request: request(JSON.stringify({ id: 1, field: 'unknown', value: true })),
			}),
		);

		expect(malformed.status).toBe(400);
		expect(invalid.status).toBe(400);
	});

	it('returns not found for a valid flag update without an existing cadastro', async () => {
		const response = await invoke(
			POST,
			createRequestEvent({
				locals: { user: secretariaUser, session: null },
				request: request(JSON.stringify({ id: 32767, field: 'amigoFraterno', value: true })),
			}),
		);

		expect(response.status).toBe(404);
	});
});

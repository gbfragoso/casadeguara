import { describe, expect, it, vi } from 'vitest';

import { cadastroModel } from '$lib/server/models/cadastro';
import { tesourariaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { actions as newActions } from '../../../../../src/routes/(protected)/tesouraria/contribuintes/novo/+page.server';

const event = (entries: Record<string, string>) => {
	const form = new FormData();
	for (const [key, value] of Object.entries(entries)) form.set(key, value);

	return createRequestEvent({
		locals: { user: tesourariaUser, session: null },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('tesouraria create adapter failures', () => {
	it('returns a validation failure for an empty contributor form', async () => {
		const result = await invoke(newActions.default, event({}));

		expect(result).toMatchObject({ status: 400 });
	});

	it('maps an unexpected persistence failure to an internal error', async () => {
		const failure = vi.spyOn(cadastroModel, 'createTesouraria').mockRejectedValue(new Error('database'));

		try {
			await expect(invoke(newActions.default, event({ nome: 'Falha inesperada' }))).rejects.toMatchObject({
				status: 500,
			});
		} finally {
			failure.mockRestore();
		}
	});
});

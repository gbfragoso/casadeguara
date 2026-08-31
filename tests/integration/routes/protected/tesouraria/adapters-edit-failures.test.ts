import { describe, expect, it, vi } from 'vitest';

import { cadastroModel } from '$lib/server/models/cadastro';
import { tesourariaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { actions as editActions } from '../../../../../src/routes/(protected)/tesouraria/contribuintes/[id=integer]/+page.server';

describe('tesouraria edit adapter failures', () => {
	it('maps an unexpected update failure to an internal error', async () => {
		const form = new FormData();
		form.set('nome', 'Falha inesperada');
		const failure = vi.spyOn(cadastroModel, 'updateTesouraria').mockRejectedValue(new Error('database'));

		try {
			await expect(
				invoke(
					editActions.default,
					createRequestEvent({
						locals: { user: tesourariaUser, session: null },
						params: { id: '1' },
						request: new Request('http://localhost/', { method: 'POST', body: form }),
					}),
				),
			).rejects.toMatchObject({ status: 500 });
		} finally {
			failure.mockRestore();
		}
	});
});

import { describe, expect, it, vi } from 'vitest';

import { cadastroModel } from '$lib/server/models/cadastro';
import { secretariaUser } from '../../../support/auth';
import { createRequestEvent, invoke } from '../../../support/request-event';
import { actions as newActions } from '../../../../../src/routes/(protected)/secretaria/cadastros/novo/+page.server';
import {
	actions as editActions,
	load as editLoad,
} from '../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/+page.server';

const event = (entries: Record<string, string>) => {
	const form = new FormData();
	for (const [key, value] of Object.entries(entries)) form.set(key, value);

	return createRequestEvent({
		locals: { user: secretariaUser, session: null },
		request: new Request('http://localhost/', { method: 'POST', body: form }),
	});
};

describe('secretaria create adapter failures', () => {
	it('returns a validation failure for an empty worker form', async () => {
		const result = await invoke(newActions.default, event({}));

		expect(result).toMatchObject({ status: 400 });
	});

	it('maps an unexpected persistence failure to an internal error', async () => {
		const failure = vi.spyOn(cadastroModel, 'createSecretaria').mockRejectedValue(new Error('database'));

		try {
			await expect(invoke(newActions.default, event({ nome: 'Falha inesperada' }))).rejects.toMatchObject({
				status: 500,
			});
		} finally {
			failure.mockRestore();
		}
	});

	it('maps an unexpected edit load failure to an internal error', async () => {
		const failure = vi.spyOn(cadastroModel, 'getSecretaria').mockRejectedValue(new Error('database'));

		try {
			await expect(
				invoke(
					editLoad,
					createRequestEvent({ locals: { user: secretariaUser, session: null }, params: { id: '1' } }),
				),
			).rejects.toMatchObject({ status: 500 });
		} finally {
			failure.mockRestore();
		}
	});

	it('maps an unexpected edit persistence failure to an internal error', async () => {
		const form = new FormData();
		form.set('nome', 'Falha inesperada');
		const failure = vi.spyOn(cadastroModel, 'updateSecretaria').mockRejectedValue(new Error('database'));

		try {
			await expect(
				invoke(
					editActions.salvarCadastro,
					createRequestEvent({
						locals: { user: secretariaUser, session: null },
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

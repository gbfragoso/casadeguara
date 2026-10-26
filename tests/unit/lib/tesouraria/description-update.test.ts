import type { ActionResult } from '$app/forms';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SubmitAction } from '#lib/forms/action-request.js';
import { DESCRIPTION_SAVE_FAILURE_MESSAGE, submitDescriptionChange } from '#lib/tesouraria/description-update.js';

const LOCATION = '/tesouraria/lancamentos';

const createSubmit = (result: ActionResult | Error) =>
	vi.fn<SubmitAction>(() => (result instanceof Error ? Promise.reject(result) : Promise.resolve(result)));

afterEach(() => {
	vi.restoreAllMocks();
});

describe('submitDescriptionChange', () => {
	it('sends the id and description to the editarDescricao action and returns the saved description', async () => {
		const submit = createSubmit({
			type: 'success',
			status: 200,
			data: { id: 12, descricao: 'Mensalidade de outubro' },
			location: LOCATION,
		});

		const result = await submitDescriptionChange(submit, 12, 'Mensalidade de outubro ');

		expect(submit).toHaveBeenCalledWith('?/editarDescricao', { id: '12', descricao: 'Mensalidade de outubro ' });
		expect(result).toEqual({ ok: true, descricao: 'Mensalidade de outubro' });
	});

	it('returns the server failure message', async () => {
		const submit = createSubmit({
			type: 'failure',
			status: 409,
			data: { message: 'Lançamento já estornado.' },
			location: LOCATION,
		});

		const result = await submitDescriptionChange(submit, 12, 'Mensalidade');

		expect(result).toEqual({ ok: false, message: 'Lançamento já estornado.' });
	});

	it('returns the default message when the request fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const submit = createSubmit(new TypeError('Failed to fetch'));

		const result = await submitDescriptionChange(submit, 12, 'Mensalidade');

		expect(result).toEqual({ ok: false, message: DESCRIPTION_SAVE_FAILURE_MESSAGE });
	});

	it.each<[string, ActionResult]>([
		[
			'a server error',
			{ type: 'error', status: 500, error: { message: 'Falha', status: 500 }, location: LOCATION },
		],
		['a redirect', { type: 'redirect', status: 303, location: LOCATION }],
		['a success without description', { type: 'success', status: 200, data: { id: 12 }, location: LOCATION }],
		['a failure without message', { type: 'failure', status: 400, data: {}, location: LOCATION }],
	])('returns the default message for %s', async (_, actionResult) => {
		const submit = createSubmit(actionResult);

		const result = await submitDescriptionChange(submit, 12, 'Mensalidade');

		expect(result).toEqual({ ok: false, message: DESCRIPTION_SAVE_FAILURE_MESSAGE });
	});
});

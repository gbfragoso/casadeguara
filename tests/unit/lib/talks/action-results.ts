import type { ActionResult } from '$app/forms';

const LOCATION = '/comunicacao/palestras';

export const actionSuccess = (data: Record<string, unknown> = {}): ActionResult => ({
	type: 'success',
	status: 200,
	data,
	location: LOCATION,
});

export const actionFailure = (status: number, data: Record<string, unknown>): ActionResult => ({
	type: 'failure',
	status,
	data,
	location: LOCATION,
});

export const actionError = (): ActionResult => ({
	type: 'error',
	status: 500,
	error: { message: 'Não foi possível concluir a operação. Nada foi alterado.', status: 500 },
	location: LOCATION,
});

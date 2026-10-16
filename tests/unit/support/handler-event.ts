import { isHttpError, isRedirect } from '@sveltejs/kit';

import { createRequestEvent, invoke } from '../../integration/support/request-event';

type EventOptions = {
	roles?: string | null;
	userId?: string;
	form?: Record<string, string | string[]>;
	params?: Record<string, string>;
	url?: string;
};

const DEFAULT_URL = 'http://localhost/';

const createFormRequest = (url: string, form: Record<string, string | string[]>) => {
	const body = new FormData();
	Object.entries(form).forEach(([name, value]) => [value].flat().forEach((item) => body.append(name, item)));

	return new Request(url, { method: 'POST', body });
};

export const createHandlerEvent = ({
	roles = null,
	userId = 'user-1',
	form = {},
	params = {},
	url = DEFAULT_URL,
}: EventOptions) =>
	createRequestEvent({
		locals: {
			user: roles === null ? null : { id: userId, username: 'usuario@example.com', name: 'Usuário', roles },
			session: null,
		},
		params,
		request: createFormRequest(url, form),
		url: new URL(url),
	});

export const runHandler = async (handler: (...args: never[]) => unknown, options: EventOptions = {}) => {
	const event = createHandlerEvent(options);
	const result = await invoke(handler, event);

	return { event, result };
};

const captureThrown = async (handler: (...args: never[]) => unknown, options: EventOptions) => {
	const event = createHandlerEvent(options);
	const thrown = await Promise.resolve()
		.then(() => invoke(handler, event))
		.then(
			() => undefined,
			(reason: unknown) => reason,
		);

	return { event, thrown };
};

export const expectRedirect = async (handler: (...args: never[]) => unknown, options: EventOptions = {}) => {
	const { event, thrown } = await captureThrown(handler, options);
	if (!isRedirect(thrown)) throw new Error('Expected the handler to redirect', { cause: thrown });

	return { event, redirect: thrown };
};

export const expectHttpError = async (handler: (...args: never[]) => unknown, options: EventOptions = {}) => {
	const { event, thrown } = await captureThrown(handler, options);
	if (!isHttpError(thrown)) throw new Error('Expected the handler to fail with an HTTP error', { cause: thrown });

	return { event, error: thrown };
};

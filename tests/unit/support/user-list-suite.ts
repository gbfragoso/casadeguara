import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, expect, it, vi } from 'vitest';

import { fakeDatabase } from './fake-database';
import { expectRedirect, runHandler } from './handler-event';

type Handler = (...args: never[]) => unknown;
type SuiteOptions = { viewerRoles: string; createHandlers: () => { load: Handler } };

const listUrl = 'http://localhost/usuarios';

const describeListQuery = ({ viewerRoles, createHandlers }: SuiteOptions) => {
	it('never selects the password hash', async () => {
		await runHandler(createHandlers().load, { roles: viewerRoles, url: listUrl });

		expect(Object.keys(fakeDatabase.argumentsOf('select')?.[0] as object)).toEqual(['id', 'name']);
	});

	it.each([
		['the first page by default', listUrl, 0],
		['the requested page', `${listUrl}?page=3`, 10],
	])('starts the listing at %s', async (_scenario, url, offset) => {
		await runHandler(createHandlers().load, { roles: viewerRoles, url });

		expect(fakeDatabase.argumentsOf('offset')).toEqual([offset]);
	});
};

export const describeUserListHandlers = ({ viewerRoles, createHandlers }: SuiteOptions) => {
	afterEach(() => {
		fakeDatabase.reset();
		vi.restoreAllMocks();
	});

	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(createHandlers().load, { url: listUrl });

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('streams the listed users', async () => {
		fakeDatabase.resolveWith([{ id: 'user-9', name: 'Ana' }]);

		const { result } = await runHandler(createHandlers().load, { roles: viewerRoles, url: listUrl });

		await expect((result as { usuarios: Promise<unknown> }).usuarios).resolves.toEqual([
			{ id: 'user-9', name: 'Ana' },
		]);
	});

	describeListQuery({ viewerRoles, createHandlers });
};

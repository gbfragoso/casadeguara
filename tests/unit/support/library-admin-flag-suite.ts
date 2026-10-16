import { expect, it } from 'vitest';

import { fakeDatabase } from './fake-database';
import { runHandler } from './handler-event';

type Handler = (...args: never[]) => unknown;

export const describeLibraryAdminFlag = (createLoad: () => Handler, params: Record<string, string>) => {
	it.each([
		['flags a library administrator', 'biblioteca,biblioteca:admin', true],
		['does not flag a librarian', 'biblioteca', false],
		['does not flag an administrator of another system', 'biblioteca,secretaria:admin', false],
	])('%s', async (_scenario, roles, isAdmin) => {
		fakeDatabase.resolveWith([]);

		const { result } = await runHandler(createLoad(), { roles, params });

		expect(result).toMatchObject({ isAdmin });
	});
};

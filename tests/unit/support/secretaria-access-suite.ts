import { expect, it } from 'vitest';

import { fakeDatabase } from './fake-database';
import { expectHttpError, expectRedirect, runHandler } from './handler-event';

type Handler = (...args: never[]) => unknown;

export const describeSecretariaAccess = (load: Handler, actions: Record<string, Handler>, loaded?: unknown) => {
	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(load);

		expect(redirect).toMatchObject({ status: 302, location: '/' });
	});

	it('lets a secretaria user open the page', async () => {
		const { result } = await runHandler(load, { roles: 'secretaria' });

		expect(result).toEqual(loaded);
	});

	it.each(Object.keys(actions))('rejects the %s action for a user without secretaria access', async (name) => {
		const { event, error } = await expectHttpError(actions[name], { roles: 'biblioteca', form: { mes: '10' } });

		expect(error.status).toBe(401);
		expect(event.request.bodyUsed).toBe(false);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});
};

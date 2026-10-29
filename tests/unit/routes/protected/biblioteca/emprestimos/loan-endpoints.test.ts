import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeDatabase } from '../../../../support/fake-database';
import { expectHttpError, expectRedirect, runHandler } from '../../../../support/handler-event';

vi.mock('#lib/server/database/connection.js', () => import('../../../../support/fake-database'));

const { POST: renewLoan } = await import('../../../../../../src/routes/(protected)/api/biblioteca/renovacao/+server');
const { POST: returnLoan } = await import('../../../../../../src/routes/(protected)/api/biblioteca/devolucao/+server');

const endpoints = [
	['renewal', renewLoan, 'http://localhost/api/biblioteca/renovacao?id=7'],
	['return', returnLoan, 'http://localhost/api/biblioteca/devolucao?id=7'],
] as const;

afterEach(() => {
	fakeDatabase.reset();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe.each(endpoints)('loan %s endpoint', (_endpoint, handler, url) => {
	it('redirects an anonymous visitor without touching the loan', async () => {
		const { redirect } = await expectRedirect(handler, { url });

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('rejects a user without library access without touching the loan', async () => {
		const { error } = await expectHttpError(handler, { roles: 'tesouraria,secretaria:admin', url });

		expect(error.status).toBe(401);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('fails when the loan cannot be updated', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		fakeDatabase.failWith(new Error('database offline'));

		const { error } = await expectHttpError(handler, { roles: 'biblioteca', url });

		expect(error.status).toBe(500);
	});
});

describe('loan return endpoint', () => {
	it('records the return on the Bahia civil day for an evening return', async () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date('2026-10-16T01:00:00Z'));
		fakeDatabase.resolveWith([{ idexemplar: 3 }]);

		await runHandler(returnLoan, { roles: 'biblioteca', userId: 'user-3', url: endpoints[1][2] });

		expect(fakeDatabase.argumentsOf('set')).toEqual([
			{ dataDevolvido: new Date('2026-10-15T00:00:00Z'), userDevolucao: 'user-3' },
		]);
	});
});

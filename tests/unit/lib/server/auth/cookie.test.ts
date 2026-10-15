import { describe, expect, it, vi } from 'vitest';

import { deleteSessionCookie, SESSION_COOKIE_NAME, setSessionCookie } from '#lib/server/auth/cookie.js';

import { createRequestEvent } from '../../../../integration/support/request-event';

const createCookies = () => ({ ...createRequestEvent().cookies, set: vi.fn(), delete: vi.fn() });

const protectedCookieAttributes = { path: '/', httpOnly: true, sameSite: 'lax' };

describe('session cookie', () => {
	it('stores the session token in a protected cookie that expires with the session', () => {
		const cookies = createCookies();
		const expiresAt = new Date('2026-10-15T12:30:00.000Z');

		setSessionCookie(cookies, 'token', expiresAt);

		expect(cookies.set).toHaveBeenCalledWith(SESSION_COOKIE_NAME, 'token', {
			...protectedCookieAttributes,
			secure: expect.any(Boolean),
			expires: expiresAt,
		});
	});

	it('deletes the session cookie with the attributes used to create it', () => {
		const cookies = createCookies();

		deleteSessionCookie(cookies);

		expect(cookies.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
			...protectedCookieAttributes,
			secure: expect.any(Boolean),
		});
	});
});

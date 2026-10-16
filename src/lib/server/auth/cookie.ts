import type { Cookies } from '@sveltejs/kit';

import { dev } from '$app/env';

export const SESSION_COOKIE_NAME = 'auth_session';

const sessionCookieAttributes = () => ({
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: !dev,
});

export const setSessionCookie = (cookies: Cookies, token: string, expiresAt: Date) => {
	cookies.set(SESSION_COOKIE_NAME, token, { ...sessionCookieAttributes(), expires: expiresAt });
};

export const deleteSessionCookie = (cookies: Cookies) => {
	cookies.delete(SESSION_COOKIE_NAME, sessionCookieAttributes());
};

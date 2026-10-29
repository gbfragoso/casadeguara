import { describe, expect, it } from 'vitest';

import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { requireReaderAccess } from '#lib/server/biblioteca/readers/access.js';

describe('library reader access', () => {
	it('sends an anonymous visitor to the login page', () => {
		expect(() => requireReaderAccess(null)).toThrow(expect.objectContaining({ status: 302, location: LOGIN_PATH }));
	});

	it('refuses a user without library access', () => {
		expect(() => requireReaderAccess({ id: 'foreign', roles: 'secretaria' })).toThrow(
			expect.objectContaining({ status: 401 }),
		);
	});

	it('allows a library user', () => {
		const user = { id: 'librarian', roles: 'biblioteca' };

		expect(requireReaderAccess(user)).toBe(user);
	});
});

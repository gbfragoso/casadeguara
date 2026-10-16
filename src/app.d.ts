declare global {
	namespace App {
		interface Locals {
			user: import('#lib/server/auth/session.js').SessionUser | null;
			session: import('#lib/server/auth/session.js').Session | null;
		}
	}
}

export {};

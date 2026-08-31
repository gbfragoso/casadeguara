import type { Cookies } from '@sveltejs/kit';

export type TestUser = {
	id: string;
	username: string;
	name: string;
	roles: string;
};

export type RouteEvent = {
	cookies: Cookies;
	fetch: typeof fetch;
	getClientAddress: () => string;
	locals: { user: TestUser | null; session: null };
	params: Record<string, string>;
	platform: undefined;
	request: Request;
	route: { id: string };
	setHeaders: (headers: Record<string, string>) => void;
	url: URL;
	isDataRequest: boolean;
	isSubRequest: boolean;
	isRemoteRequest: boolean;
	tracing: { enabled: boolean; root: object; current: object };
	parent: () => Promise<Record<string, never>>;
	depends: (...dependencies: string[]) => void;
	untrack: <T>(callback: () => T) => T;
};

const createCookies = (): Cookies => ({
	get: () => undefined,
	getAll: () => [],
	set: () => undefined,
	delete: () => undefined,
	serialize: (name, value) => `${name}=${value}`,
});

export const createRequestEvent = (overrides: Partial<RouteEvent> = {}): RouteEvent => {
	return {
		cookies: createCookies(),
		fetch,
		getClientAddress: () => '127.0.0.1',
		locals: { user: null, session: null },
		params: {},
		platform: undefined,
		request: new Request('http://localhost/'),
		route: { id: '/' },
		setHeaders: () => undefined,
		url: new URL('http://localhost/'),
		isDataRequest: false,
		isSubRequest: false,
		isRemoteRequest: false,
		tracing: { enabled: false, root: {}, current: {} },
		parent: async () => ({}),
		depends: () => undefined,
		untrack: (callback) => callback(),
		...overrides,
	};
};

export const invoke = <Result>(handler: (...args: never[]) => Result, event: RouteEvent): Result =>
	Reflect.apply(handler, undefined, [event]);

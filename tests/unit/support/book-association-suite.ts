import { LOGIN_PATH } from '#lib/navigation/system-modules.js';
import { afterEach, expect, it, vi } from 'vitest';

import { fakeDatabase } from './fake-database';
import { expectHttpError, expectRedirect, runHandler } from './handler-event';
import { describeLibraryAdminFlag } from './library-admin-flag-suite';

type Handler = (...args: never[]) => unknown;
type AssociationHandlers = { load: Handler; actions: Record<string, Handler> };
type SuiteOptions = {
	field: string;
	listKeys: string[];
	createHandlers: () => AssociationHandlers;
	additionalValues?: Record<string, unknown>;
};

const params = { id: '3' };
const librarian = { roles: 'biblioteca', params };
const administrator = { roles: 'biblioteca,biblioteca:admin', params };

const failingDatabase = () => {
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
	fakeDatabase.failWith(new Error('database offline'));
};

const describeLoad = ({ listKeys, createHandlers }: SuiteOptions) => {
	it('redirects an anonymous visitor', async () => {
		const { redirect } = await expectRedirect(createHandlers().load, { params });

		expect(redirect).toMatchObject({ status: 302, location: LOGIN_PATH });
	});

	it('rejects a user without library access', async () => {
		const { error } = await expectHttpError(createHandlers().load, { roles: 'secretaria', params });

		expect(error.status).toBe(401);
	});

	it('streams the book associations', async () => {
		fakeDatabase.resolveWith([{ idlivro: 3 }]);

		const { result } = await runHandler(createHandlers().load, librarian);

		await Promise.all(
			[...listKeys, 'livros'].map((key) =>
				expect((result as Record<string, unknown>)[key]).resolves.toEqual([{ idlivro: 3 }]),
			),
		);
	});

	describeLibraryAdminFlag(() => createHandlers().load, params);
};

const describeAddition = ({ field, createHandlers, additionalValues = {} }: SuiteOptions) => {
	it('rejects an addition from a user without library access before reading the form', async () => {
		const { event, error } = await expectHttpError(createHandlers().actions.adicionar, {
			roles: 'secretaria',
			form: { [field]: '5' },
			params,
		});

		expect(error.status).toBe(401);
		expect(event.request.bodyUsed).toBe(false);
	});

	it('associates the selected item with the book', async () => {
		const { result } = await runHandler(createHandlers().actions.adicionar, {
			...librarian,
			form: { [field]: '5' },
		});

		expect(result).toEqual({ status: 201 });
		expect(fakeDatabase.argumentsOf('values')).toEqual([{ [field]: 5, livro: 3, ...additionalValues }]);
	});

	it('fails when the association cannot be created', async () => {
		failingDatabase();

		const { error } = await expectHttpError(createHandlers().actions.adicionar, {
			...librarian,
			form: { [field]: '5' },
		});

		expect(error.status).toBe(500);
	});
};

const describeRemoval = ({ field, createHandlers }: SuiteOptions) => {
	const url = `http://localhost/?/excluir&${field}=5`;

	it('rejects a removal from a non-administrator', async () => {
		const { error } = await expectHttpError(createHandlers().actions.excluir, { ...librarian, url });

		expect(error.status).toBe(401);
		expect(fakeDatabase.queries()).toHaveLength(0);
	});

	it('requires the item to remove', async () => {
		const { result } = await runHandler(createHandlers().actions.excluir, {
			...administrator,
			url: 'http://localhost/?/excluir',
		});

		expect(result).toMatchObject({ status: 400 });
	});

	it('removes the association for an administrator', async () => {
		const { result } = await runHandler(createHandlers().actions.excluir, { ...administrator, url });

		expect(result).toEqual({ status: 200 });
		expect(fakeDatabase.queries()).toMatchObject([{ operation: 'delete' }]);
	});

	it('fails when the association cannot be removed', async () => {
		failingDatabase();

		const { error } = await expectHttpError(createHandlers().actions.excluir, { ...administrator, url });

		expect(error.status).toBe(500);
	});
};

export const describeBookAssociationHandlers = (options: SuiteOptions) => {
	afterEach(() => {
		fakeDatabase.reset();
		vi.restoreAllMocks();
	});

	describeLoad(options);
	describeAddition(options);
	describeRemoval(options);
};

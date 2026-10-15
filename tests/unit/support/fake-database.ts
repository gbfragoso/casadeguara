type RecordedCall = { method: string; args: unknown[] };
type RecordedQuery = { operation: string; calls: RecordedCall[] };

const state = {
	result: [] as unknown,
	failure: undefined as Error | undefined,
	queries: [] as RecordedQuery[],
};

const settle = () => (state.failure ? Promise.reject(state.failure) : Promise.resolve(state.result));

const createQuery = (operation: string, args: unknown[]): object => {
	const recorded: RecordedQuery = { operation, calls: [{ method: operation, args }] };
	state.queries.push(recorded);

	const query: object = new Proxy(
		{},
		{
			get: (_target, method) => {
				if (method === 'then') {
					return (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
						settle().then(resolve, reject);
				}

				return (...callArgs: unknown[]) => {
					recorded.calls.push({ method: String(method), args: callArgs });
					return query;
				};
			},
		},
	);

	return query;
};

const operation =
	(name: string) =>
	(...args: unknown[]) =>
		createQuery(name, args);

export const db = {
	select: operation('select'),
	insert: operation('insert'),
	update: operation('update'),
	delete: operation('delete'),
};

export const fakeDatabase = {
	resolveWith: (result: unknown) => {
		state.result = result;
	},
	failWith: (failure: Error) => {
		state.failure = failure;
	},
	queries: () => state.queries,
	argumentsOf: (method: string) =>
		state.queries.flatMap((query) => query.calls).find((call) => call.method === method)?.args,
	reset: () => {
		state.result = [];
		state.failure = undefined;
		state.queries = [];
	},
};

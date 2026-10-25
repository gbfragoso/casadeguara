import { afterEach, describe, expect, it, vi } from 'vitest';

const MOVE_RESULT = { type: 'success', status: 200, data: { operacao: 'mover', palestraId: 31 } } as const;
const deserialize = vi.hoisted(() => vi.fn());
vi.mock('$app/forms', () => ({ deserialize }));

import { submitAction } from '#lib/forms/action-request.js';

const SERIALIZED_MOVE = '{"type":"success","status":200,"data":"[{\\"operacao\\":1}]"}';

afterEach(() => {
	vi.unstubAllGlobals();
	deserialize.mockReset();
});

const stubFetch = (body: string) => {
	const fetchAction = vi.fn<typeof fetch>().mockResolvedValue(new Response(body));
	vi.stubGlobal('fetch', fetchAction);
	return fetchAction;
};

const readRequest = (fetchAction: ReturnType<typeof stubFetch>) => {
	const [action, init] = fetchAction.mock.calls[0] ?? [];
	if (!(init?.body instanceof FormData)) throw new Error('A action não recebeu um FormData.');
	return { action, method: init.method, headers: new Headers(init.headers), body: init.body };
};

describe('submitAction', () => {
	it('posts repeated fields as a SvelteKit action request', async () => {
		const fetchAction = stubFetch(SERIALIZED_MOVE);

		await submitAction('?/mover', { origemId: '31', ids: ['31', '32'], versoes: ['3', '1'] });

		const request = readRequest(fetchAction);
		expect(request).toMatchObject({ action: '?/mover', method: 'POST' });
		expect(request.headers.get('x-sveltekit-action')).toBe('true');
		expect(request.body.get('origemId')).toBe('31');
		expect(request.body.getAll('ids')).toEqual(['31', '32']);
		expect(request.body.getAll('versoes')).toEqual(['3', '1']);
	});

	it('returns the action result deserialized from the response body', async () => {
		stubFetch(SERIALIZED_MOVE);
		deserialize.mockReturnValue(MOVE_RESULT);

		const result = await submitAction('?/mover', { origemId: '31' });

		expect(deserialize).toHaveBeenCalledWith(SERIALIZED_MOVE);
		expect(result).toBe(MOVE_RESULT);
	});
});

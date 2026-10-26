import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestTalkArt } from '#lib/talks/art/request.js';

const TALK = { id: 412, versao: 4 };
const ART_FAILURE_MESSAGE = 'Não foi possível gerar a arte. Tente novamente.';
const CONFLICT_MESSAGE = 'Outra pessoa alterou esta programação. O board foi atualizado; confira e tente de novo.';

const respondWith = (response: Response) => vi.fn<typeof fetch>(() => Promise.resolve(response));

const failWith = (status: number, body: unknown) => respondWith(Response.json(body, { status }));

const request = (fetcher: typeof fetch, signal = new AbortController().signal) => requestTalkArt(fetcher, TALK, signal);

afterEach(() => {
	vi.restoreAllMocks();
});

describe('TU-25 requestTalkArt', () => {
	it('asks for the art of the version shown on the card', async () => {
		const fetcher = respondWith(new Response(new Blob(['png'], { type: 'image/png' })));
		const { signal } = new AbortController();

		await request(fetcher, signal);

		expect(fetcher).toHaveBeenCalledWith('/comunicacao/palestras/412/arte?versao=4', { signal });
	});

	it('returns the PNG of a successful response as a blob', async () => {
		const fetcher = respondWith(new Response(new Blob(['png'], { type: 'image/png' })));

		const result = await request(fetcher);

		if (!result.ok) throw new Error('A arte deveria ter sido recebida.');
		expect(result.image.type).toBe('image/png');
		expect(await result.image.text()).toBe('png');
	});

	it.each([404, 409])('marks a %i response as stale with the server message', async (status) => {
		const fetcher = failWith(status, { message: CONFLICT_MESSAGE });

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: CONFLICT_MESSAGE, stale: true });
	});

	it('keeps the server message of other failures without marking them stale', async () => {
		const message = 'O título está maior do que cabe na arte. Encurte-o no card para gerar a arte.';
		const fetcher = failWith(422, { message });

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message, stale: false });
	});

	it('falls back to the default message when the failure has no readable message', async () => {
		const fetcher = respondWith(new Response('Internal Server Error', { status: 500 }));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: ART_FAILURE_MESSAGE, stale: false });
	});

	it('reports a network error with the default message', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const fetcher = vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: ART_FAILURE_MESSAGE, stale: false });
		expect(error).toHaveBeenCalledWith('comunicacao.palestras.arte_falhou', expect.anything());
	});

	it('does not log a request cancelled by closing the dialog', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const controller = new AbortController();
		controller.abort();
		const fetcher = vi.fn<typeof fetch>(() => Promise.reject(new DOMException('Aborted', 'AbortError')));

		await request(fetcher, controller.signal);

		expect(error).not.toHaveBeenCalled();
	});
});

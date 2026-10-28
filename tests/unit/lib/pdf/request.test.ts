import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { type PdfFailureContract, requestPdf } from '#lib/pdf/request.js';

type Failure = { message: string };

const PDF_URL = '/relatorio/pdf?mes=11';
const FALLBACK_MESSAGE = 'Não foi possível gerar o PDF.';
const CONTRACT: PdfFailureContract<Failure> = {
	schema: z.object({ message: z.string().min(1) }),
	fallback: { message: FALLBACK_MESSAGE },
	logEvent: 'relatorio.pdf_falhou',
	logContext: { mes: '11' },
};

const respondWith = (response: Response) => vi.fn<typeof fetch>(() => Promise.resolve(response));

const request = (fetcher: typeof fetch, signal = new AbortController().signal) =>
	requestPdf(fetcher, PDF_URL, signal, CONTRACT);

afterEach(() => {
	vi.restoreAllMocks();
});

describe('TU-08 requestPdf delivers the PDF', () => {
	it('asks for the URL with the cancellation signal', async () => {
		const fetcher = respondWith(new Response(new Blob(['%PDF'])));
		const { signal } = new AbortController();

		await request(fetcher, signal);

		expect(fetcher).toHaveBeenCalledWith(PDF_URL, { signal });
	});

	it('returns the received PDF as a blob', async () => {
		const fetcher = respondWith(new Response(new Blob(['%PDF'], { type: 'application/pdf' })));

		const result = await request(fetcher);

		if (!result.ok) throw new Error('O PDF deveria ter sido recebido.');
		expect(result.pdf.type).toBe('application/pdf');
		expect(await result.pdf.text()).toBe('%PDF');
	});
});

describe('TU-08 requestPdf translates failures', () => {
	it('keeps the refusal validated by the contract schema', async () => {
		const message = 'Nenhum aniversariante encontrado em novembro.';
		const fetcher = respondWith(Response.json({ message, extra: true }, { status: 422 }));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message });
	});

	it('falls back to the contract failure when the body breaks the schema', async () => {
		const fetcher = respondWith(Response.json({ message: '' }, { status: 500 }));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: FALLBACK_MESSAGE });
	});

	it('falls back to the contract failure when the body is not JSON', async () => {
		const fetcher = respondWith(new Response('Internal Server Error', { status: 500 }));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: FALLBACK_MESSAGE });
	});

	it('reports a network error with the contract event and context', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const fetcher = vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: FALLBACK_MESSAGE });
		expect(error).toHaveBeenCalledWith('relatorio.pdf_falhou', expect.objectContaining({ mes: '11' }));
	});

	it('does not log a cancelled request', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const controller = new AbortController();
		controller.abort();
		const fetcher = vi.fn<typeof fetch>(() => Promise.reject(new DOMException('Aborted', 'AbortError')));

		await request(fetcher, controller.signal);

		expect(error).not.toHaveBeenCalled();
	});
});

import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestAttendancePdf } from '#lib/attendance/request.js';

const NOVEMBER_PARAMS = 'titulo=Lista&dataInicio=2026-11-01&dataFim=2026-11-30&dias=1&dias=2&dias=4';
const NOVEMBER_PERIOD = { start: '2026-11-01', end: '2026-11-30' };

const respondWith = (response: Response) => vi.fn<typeof fetch>(() => Promise.resolve(response));

const request = (fetcher: typeof fetch, signal = new AbortController().signal) =>
	requestAttendancePdf(fetcher, { params: new URLSearchParams(NOVEMBER_PARAMS), period: NOVEMBER_PERIOD }, signal);

afterEach(() => {
	vi.restoreAllMocks();
});

describe('requestAttendancePdf', () => {
	it('asks for the PDF with the form parameters and the cancellation signal', async () => {
		const fetcher = respondWith(new Response(new Blob(['%PDF'], { type: 'application/pdf' })));
		const { signal } = new AbortController();

		await request(fetcher, signal);

		expect(fetcher).toHaveBeenCalledWith(`/secretaria/frequencia/pdf?${NOVEMBER_PARAMS}`, { signal });
	});

	it('keeps the message of a list without workers', async () => {
		const message = 'Nenhum trabalhador marcado para a lista de frequência. Marque-os em Cadastros.';
		const fetcher = respondWith(Response.json({ message }, { status: 422 }));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message });
	});

	it('logs a network error with the period and without the title', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const fetcher = vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: 'Não foi possível gerar o PDF. Tente novamente.' });
		expect(error).toHaveBeenCalledWith('secretaria.frequencia.pdf_falhou', {
			inicio: '2026-11-01',
			fim: '2026-11-30',
			error: expect.any(TypeError),
		});
	});
});

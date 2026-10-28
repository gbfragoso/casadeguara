import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestBirthdayPdf } from '#lib/birthdays/request.js';
import { createCalendarMonth } from '#lib/utils/calendar-month.js';

const NOVEMBER = createCalendarMonth(2026, 11);
const GENERATION_FAILURE_MESSAGE = 'Não foi possível gerar o PDF. Tente novamente.';

const respondWith = (response: Response) => vi.fn<typeof fetch>(() => Promise.resolve(response));

const request = (fetcher: typeof fetch, signal = new AbortController().signal) =>
	requestBirthdayPdf(fetcher, NOVEMBER, signal);

afterEach(() => {
	vi.restoreAllMocks();
});

describe('TU-15 requestBirthdayPdf asks for the birthday PDF', () => {
	it('asks for the chosen month with the cancellation signal', async () => {
		const fetcher = respondWith(new Response(new Blob(['%PDF'], { type: 'application/pdf' })));
		const { signal } = new AbortController();

		await request(fetcher, signal);

		expect(fetcher).toHaveBeenCalledWith('/secretaria/aniversariantes/pdf?mes=11', { signal });
	});

	it('keeps the message of an empty month', async () => {
		const message = 'Nenhum aniversariante encontrado em novembro.';
		const fetcher = respondWith(Response.json({ message }, { status: 422 }));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message });
	});

	it('reports a network error with the generic message', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const fetcher = vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: GENERATION_FAILURE_MESSAGE });
		expect(error).toHaveBeenCalledWith(
			'secretaria.aniversariantes.pdf_falhou',
			expect.objectContaining({ mes: '2026-11' }),
		);
	});
});

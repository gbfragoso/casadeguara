import { afterEach, describe, expect, it, vi } from 'vitest';

import { listProgramMonths } from '#lib/talks/program/months.js';
import { requestTalkProgram } from '#lib/talks/program/request.js';

const [, NOVEMBER] = listProgramMonths('2026-10-27');
const PROGRAM_FAILURE_MESSAGE = 'Não foi possível gerar a programação. Tente novamente.';
const PENDENCY_MESSAGE = 'Complete estas palestras no quadro para gerar a programação:';
const PENDENCIES = [
	{ id: 501, quando: 'Segunda-feira, 02/11/2026 · 08:45', falta: 'Falta o palestrante.' },
	{ id: 507, quando: 'Sábado, 07/11/2026 · 14:30', falta: 'Falta o título.' },
];

const respondWith = (response: Response) => vi.fn<typeof fetch>(() => Promise.resolve(response));

const servePdf = () => respondWith(new Response(new Blob(['%PDF'], { type: 'application/pdf' })));

const request = (fetcher: typeof fetch, signal = new AbortController().signal) =>
	requestTalkProgram(fetcher, NOVEMBER, signal);

afterEach(() => {
	vi.restoreAllMocks();
});

describe('TU-11 requestTalkProgram asks for the program', () => {
	it('asks for the chosen month with the cancellation signal', async () => {
		const fetcher = servePdf();
		const { signal } = new AbortController();

		await request(fetcher, signal);

		expect(fetcher).toHaveBeenCalledWith('/comunicacao/palestras/programacao?mes=2026-11', { signal });
	});
});

describe('TU-12 requestTalkProgram translates refusals', () => {
	it('keeps the message and the pendencies of a blocked month', async () => {
		const fetcher = respondWith(
			Response.json({ message: PENDENCY_MESSAGE, pendencias: PENDENCIES }, { status: 422 }),
		);

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: PENDENCY_MESSAGE, pendencias: PENDENCIES });
	});

	it('keeps the message of a month outside the window without pendencies', async () => {
		const message = 'Escolha o mês atual ou o próximo.';
		const fetcher = respondWith(Response.json({ message }, { status: 400 }));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message, pendencias: [] });
	});
});

describe('TU-13 requestTalkProgram falls back to the program failure', () => {
	it('falls back to the generic message when the body is invalid', async () => {
		const fetcher = respondWith(new Response('Internal Server Error', { status: 500 }));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: PROGRAM_FAILURE_MESSAGE, pendencias: [] });
	});

	it('reports a network error with the generic message', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const fetcher = vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')));

		const result = await request(fetcher);

		expect(result).toEqual({ ok: false, message: PROGRAM_FAILURE_MESSAGE, pendencias: [] });
		expect(error).toHaveBeenCalledWith(
			'comunicacao.palestras.programacao_falhou',
			expect.objectContaining({ mes: '2026-11' }),
		);
	});
});

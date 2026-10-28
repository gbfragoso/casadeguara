// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PdfDelivery } from '#lib/pdf/delivery.svelte.js';
import type { PdfResult } from '#lib/pdf/request.js';

type Failure = { message: string };
type Result = PdfResult<Failure>;
type Request = (signal: AbortSignal) => Promise<Result>;

const PDF: Result = { ok: true, pdf: new Blob(['%PDF'], { type: 'application/pdf' }) };
const EMPTY_MONTH: Result = { ok: false, message: 'Mês vazio.' };

const answerWith = (result: Result) => vi.fn<Request>(() => Promise.resolve(result));

const answerLater = () => {
	let answer: (result: Result) => void = () => undefined;
	const request = vi.fn<Request>(() => new Promise((resolve) => (answer = resolve)));
	return { request, answer: (result: Result) => answer(result) };
};

const deliverReady = async (delivery: PdfDelivery<string, Failure>, subject: string) => {
	await delivery.deliver(subject, answerWith(PDF));
	if (delivery.current.status !== 'ready') throw new Error('O PDF deveria estar pronto.');
	return delivery.current.url;
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe('PdfDelivery delivers the PDF', () => {
	it('shows the subject as loading while the request is pending', () => {
		const delivery = new PdfDelivery<string, Failure>();

		void delivery.deliver('2026-11', answerLater().request);

		expect(delivery.current).toEqual({ status: 'loading', subject: '2026-11' });
	});

	it('exposes the received PDF as an object URL', async () => {
		const delivery = new PdfDelivery<string, Failure>();

		const url = await deliverReady(delivery, '2026-11');

		expect(url).toMatch(/^blob:/);
		expect(delivery.current).toMatchObject({ status: 'ready', subject: '2026-11' });
	});

	it('exposes the failure of the request', async () => {
		const delivery = new PdfDelivery<string, Failure>();

		await delivery.deliver('2026-11', answerWith(EMPTY_MONTH));

		expect(delivery.current).toMatchObject({ status: 'failed', subject: '2026-11', message: 'Mês vazio.' });
	});
});

describe('TU-09 PdfDelivery shows only the last request', () => {
	it('aborts the previous request', () => {
		const delivery = new PdfDelivery<string, Failure>();
		const first = answerLater();
		void delivery.deliver('2026-10', first.request);

		void delivery.deliver('2026-11', answerLater().request);

		expect(first.request.mock.calls[0][0].aborted).toBe(true);
	});

	it('ignores the slow answer of the previous request', async () => {
		const delivery = new PdfDelivery<string, Failure>();
		const first = answerLater();
		const firstDelivery = delivery.deliver('2026-10', first.request);
		await delivery.deliver('2026-11', answerWith(EMPTY_MONTH));

		first.answer(PDF);
		await firstDelivery;

		expect(delivery.current).toMatchObject({ status: 'failed', subject: '2026-11', message: 'Mês vazio.' });
	});

	it('revokes the previous object URL', async () => {
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		const delivery = new PdfDelivery<string, Failure>();
		const url = await deliverReady(delivery, '2026-10');

		void delivery.deliver('2026-11', answerLater().request);

		expect(revoke).toHaveBeenCalledWith(url);
	});
});

describe('TU-10 PdfDelivery.reset', () => {
	it('aborts the pending request and returns to idle', () => {
		const delivery = new PdfDelivery<string, Failure>();
		const pending = answerLater();
		void delivery.deliver('2026-11', pending.request);

		delivery.reset();

		expect(pending.request.mock.calls[0][0].aborted).toBe(true);
		expect(delivery.current).toEqual({ status: 'idle' });
	});

	it('revokes the ready object URL', async () => {
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		const delivery = new PdfDelivery<string, Failure>();
		const url = await deliverReady(delivery, '2026-11');

		delivery.reset();

		expect(revoke).toHaveBeenCalledWith(url);
	});
});

describe('PdfDelivery.release', () => {
	it('revokes the ready object URL and keeps the state for the unmounting view', async () => {
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		const delivery = new PdfDelivery<string, Failure>();
		const url = await deliverReady(delivery, '2026-11');

		delivery.release();

		expect(revoke).toHaveBeenCalledWith(url);
		expect(delivery.current.status).toBe('ready');
	});
});

import type { PdfResult } from '#lib/pdf/request.js';

export type PdfDeliveryState<Subject, Failure> =
	| { status: 'idle' }
	| { status: 'loading'; subject: Subject }
	| { status: 'ready'; subject: Subject; url: string }
	| ({ status: 'failed'; subject: Subject } & Failure);

export class PdfDelivery<Subject, Failure> {
	current = $state.raw<PdfDeliveryState<Subject, Failure>>({ status: 'idle' });
	#controller: AbortController | undefined;

	async deliver(subject: Subject, request: (signal: AbortSignal) => Promise<PdfResult<Failure>>): Promise<void> {
		this.release();
		const controller = new AbortController();
		this.#controller = controller;
		this.current = { status: 'loading', subject };
		const result = await request(controller.signal);
		if (controller.signal.aborted) return;

		if (result.ok) {
			this.current = { status: 'ready', subject, url: URL.createObjectURL(result.pdf) };
			return;
		}
		this.current = { ...result, status: 'failed', subject };
	}

	reset(): void {
		this.release();
		this.current = { status: 'idle' };
	}

	release(): void {
		this.#controller?.abort();
		this.#controller = undefined;
		if (this.current.status === 'ready') URL.revokeObjectURL(this.current.url);
	}
}

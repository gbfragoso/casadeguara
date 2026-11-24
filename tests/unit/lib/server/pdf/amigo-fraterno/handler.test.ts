import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBlankPdfHandler, createPdfHandler } from '#lib/server/pdf/amigo-fraterno/handler.js';

const secretariaUser = { roles: 'secretaria' };
const request = (query = 'nextDrawDate=2026-11-22', user: { roles: string } | null = secretariaUser) => ({
	locals: { user },
	url: new URL(`http://localhost/pdf?${query}`),
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('createPdfHandler', () => {
	it('returns a conflict when there are no eligible participants', async () => {
		const generatePdf = vi.fn();
		const handler = createPdfHandler({ listForPdf: vi.fn().mockResolvedValue([]) }, generatePdf);

		const response = await handler(request());

		expect(response.status).toBe(409);
		expect(generatePdf).not.toHaveBeenCalled();
	});

	it('returns a safe failure when participant loading fails', async () => {
		const handler = createPdfHandler({ listForPdf: vi.fn().mockRejectedValue(new Error('database')) }, vi.fn());

		const response = await handler(request());

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			message: 'Não foi possível gerar o PDF do Amigo Fraterno.',
		});
	});
});

describe('createBlankPdfHandler', () => {
	it('downloads the blank page for the requested draw date', async () => {
		vi.spyOn(console, 'info').mockImplementation(() => {});
		const generateBlankPdf = vi.fn().mockResolvedValue(Uint8Array.of(1));
		const handler = createBlankPdfHandler(generateBlankPdf);

		const response = await handler(request());

		expect(response.status).toBe(200);
		expect(generateBlankPdf).toHaveBeenCalledWith('2026-11-22');
		expect(response.headers.get('content-disposition')).toBe('attachment; filename="amigo-fraterno-em-branco.pdf"');
	});

	it('rejects a user without secretaria access before generating the page', async () => {
		const generateBlankPdf = vi.fn();
		const handler = createBlankPdfHandler(generateBlankPdf);

		const response = await handler(request(undefined, { roles: 'biblioteca' }));

		expect(response.status).toBe(403);
		expect(generateBlankPdf).not.toHaveBeenCalled();
	});

	it('rejects a missing session as unauthenticated before generating the page', async () => {
		const generateBlankPdf = vi.fn();
		const handler = createBlankPdfHandler(generateBlankPdf);

		const response = await handler(request(undefined, null));

		expect(response.status).toBe(401);
		expect(generateBlankPdf).not.toHaveBeenCalled();
	});

	it('rejects an invalid draw date before generating the page', async () => {
		const generateBlankPdf = vi.fn();
		const handler = createBlankPdfHandler(generateBlankPdf);

		const response = await handler(request('nextDrawDate=2026-02-29'));

		expect(response.status).toBe(400);
		expect(generateBlankPdf).not.toHaveBeenCalled();
	});

	it('returns a safe failure when the page generation fails', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const handler = createBlankPdfHandler(vi.fn().mockRejectedValue(new Error('pdf')));

		const response = await handler(request());

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			message: 'Não foi possível gerar a página em branco do Amigo Fraterno.',
		});
	});
});

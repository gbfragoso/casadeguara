import { describe, expect, it, vi } from 'vitest';
import { createPdfHandler } from '$lib/server/pdf/amigo-fraterno/handler';

const secretariaUser = { roles: 'secretaria' };
const request = () => ({
	locals: { user: secretariaUser },
	url: new URL('http://localhost/pdf?nextDrawDate=2026-11-22'),
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

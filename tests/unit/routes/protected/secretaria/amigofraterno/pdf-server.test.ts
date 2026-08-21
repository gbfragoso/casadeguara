import { describe, expect, it, vi } from 'vitest';

import { _createPdfHandler } from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/pdf/+server';
import { secretariaUser } from '../cadastros/test-support';

const participant = { id: 2, name: 'ANA', photo: null };

describe('amigo fraterno PDF handler', () => {
	it('returns a streamed PDF based on the current participant list', async () => {
		const listForPdf = vi.fn().mockResolvedValue([participant]);
		const generatePdf = vi.fn().mockResolvedValue({ bytes: Uint8Array.of(1, 2), pageCount: 1 });

		const response = await _createPdfHandler({ listForPdf }, generatePdf)({ locals: { user: secretariaUser } });

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('application/pdf');
		expect(response.headers.get('cache-control')).toBe('private, no-store');
		expect(await response.bytes()).toEqual(Uint8Array.of(1, 2));
	});

	it('rejects an empty current list', async () => {
		const generatePdf = vi.fn();

		const response = await _createPdfHandler(
			{ listForPdf: vi.fn().mockResolvedValue([]) },
			generatePdf,
		)({
			locals: { user: secretariaUser },
		});

		expect(response.status).toBe(409);
		expect(generatePdf).not.toHaveBeenCalled();
	});

	it('returns a safe failure when the query or generator fails', async () => {
		const handler = _createPdfHandler({ listForPdf: vi.fn().mockRejectedValue(new Error('database')) }, vi.fn());

		const response = await handler({ locals: { user: secretariaUser } });

		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({ message: 'Não foi possível gerar o PDF do Amigo Fraterno.' });
	});
});

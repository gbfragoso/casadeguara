import { beforeEach, describe, expect, it, vi } from 'vitest';

import { _createAmigoFraternoLoad } from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/+page.server';
import { _createPdfHandler } from '../../../../../../src/routes/(protected)/secretaria/amigofraterno/pdf/+server';

const secretariaUser = { id: 'secretaria-user', roles: 'secretaria' };
const bibliotecaUser = { id: 'biblioteca-user', roles: 'biblioteca' };

describe('amigo fraterno authorization boundaries', () => {
	const participants = { listSummary: vi.fn(), listForPdf: vi.fn() };

	beforeEach(() => vi.clearAllMocks());

	it('allows a regular secretaria user to load the participant page', async () => {
		participants.listSummary.mockResolvedValue([]);

		await expect(
			_createAmigoFraternoLoad(participants)({ locals: { user: secretariaUser } }),
		).resolves.toMatchObject({
			total: 0,
		});
	});

	it('redirects an unauthenticated page request before reading participants', async () => {
		await expect(_createAmigoFraternoLoad(participants)({ locals: { user: null } })).rejects.toMatchObject({
			status: 302,
		});
	});

	it('rejects a biblioteca page request before reading participants', async () => {
		await expect(
			_createAmigoFraternoLoad(participants)({ locals: { user: bibliotecaUser } }),
		).rejects.toMatchObject({
			status: 401,
		});
	});

	it('allows a regular secretaria user to generate a PDF', async () => {
		participants.listForPdf.mockResolvedValue([{ id: 1, name: 'ANA', photo: null }]);
		const response = await _createPdfHandler(
			participants,
			vi.fn().mockResolvedValue({ bytes: Uint8Array.of(1), pageCount: 1 }),
		)({
			locals: { user: secretariaUser },
			url: new URL('http://localhost/pdf?nextDrawDate=2026-11-22'),
		});

		expect(response.status).toBe(200);
	});

	it.each([
		['unauthenticated', null],
		['biblioteca', bibliotecaUser],
	])('rejects %s PDF requests', async (_, user) => {
		const response = await _createPdfHandler(
			participants,
			vi.fn(),
		)({
			locals: { user },
			url: new URL('http://localhost/pdf?nextDrawDate=2026-11-22'),
		});

		expect(response.status).toBe(401);
		expect(participants.listForPdf).not.toHaveBeenCalled();
	});
});

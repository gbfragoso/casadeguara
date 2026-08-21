import { describe, expect, it } from 'vitest';

import { cadastroModel } from '$lib/server/models/cadastro';
import { _createCadastroFlagHandler } from '../../../../../src/routes/(protected)/api/cadastros/+server';
import { _createPhotoHandler } from '../../../../../src/routes/(protected)/secretaria/cadastros/[id=integer]/foto/+server';
import { _createAmigoFraternoLoad } from '../../../../../src/routes/(protected)/secretaria/amigofraterno/+page.server';
import { _createPdfHandler } from '../../../../../src/routes/(protected)/secretaria/amigofraterno/pdf/+server';

import { createRawCadastro, createTestName, deleteCadastro } from '../models/cadastro/test-support';

const secretaria = { id: 'secretaria-user', roles: 'secretaria' };
const biblioteca = { id: 'biblioteca-user', roles: 'biblioteca' };
const createRequest = (id: number) =>
	new Request('http://localhost/api/cadastros', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ id, field: 'amigoFraterno', value: true }),
	});

describe('TI-10 Amigo Fraterno authorization', () => {
	it('authorizes a regular secretaria user and rejects every other profile across boundaries', async () => {
		const created = await createRawCadastro(createTestName('authorization'));
		try {
			const update = _createCadastroFlagHandler(cadastroModel);
			const allowed = await update({ locals: { user: secretaria }, request: createRequest(created.idleitor) });
			const rejected = await update({ locals: { user: biblioteca }, request: createRequest(created.idleitor) });
			expect(allowed.status).toBe(200);
			expect(rejected.status).toBe(401);

			await expect(
				_createAmigoFraternoLoad({ listSummary: async () => [] })({ locals: { user: biblioteca } }),
			).rejects.toMatchObject({
				status: 401,
			});
			expect(
				(
					await _createPhotoHandler(cadastroModel)({
						locals: { user: secretaria },
						params: { id: `${created.idleitor}` },
					})
				).status,
			).toBe(404);
			expect(
				(
					await _createPhotoHandler(cadastroModel)({
						locals: { user: biblioteca },
						params: { id: `${created.idleitor}` },
					})
				).status,
			).toBe(401);
			const emptyParticipants = { listForPdf: async () => [] };
			const emptyPdf = async () => ({ bytes: Uint8Array.of(), pageCount: 0 });
			expect(
				(
					await _createPdfHandler(
						emptyParticipants,
						emptyPdf,
					)({
						locals: { user: secretaria },
						url: new URL('http://localhost/pdf?nextDrawDate=2026-11-22'),
					})
				).status,
			).toBe(409);
			expect(
				(
					await _createPdfHandler(
						emptyParticipants,
						emptyPdf,
					)({
						locals: { user: null },
						url: new URL('http://localhost/pdf?nextDrawDate=2026-11-22'),
					})
				).status,
			).toBe(401);
		} finally {
			await deleteCadastro(created.idleitor);
		}
	});
});

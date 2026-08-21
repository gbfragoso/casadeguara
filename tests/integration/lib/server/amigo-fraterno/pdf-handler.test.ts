import { describe, expect, it, vi } from 'vitest';

import { db } from '$lib/database/connection';
import { cadastros } from '$lib/database/schema';
import { amigoFraternoParticipants } from '$lib/server/amigo-fraterno/participants';
import { _createPdfHandler } from '../../../../../src/routes/(protected)/secretaria/amigofraterno/pdf/+server';

import { createTestName, deleteCadastro } from '../models/cadastro/test-support';

const secretariaUser = { roles: 'secretaria:admin' };

describe('amigo fraterno PDF endpoint', () => {
	it('generates a document from the current eligible database projection', async () => {
		const [eligible, excluded] = await Promise.all(
			[
				{ suffix: 'ANA', amigoFraterno: true, trab: true, desencarnado: false },
				{ suffix: 'EXCLUIDO', amigoFraterno: true, trab: false, desencarnado: false },
			].map(({ suffix, ...values }) =>
				db
					.insert(cadastros)
					.values({ nome: createTestName(suffix), ...values })
					.returning(),
			),
		);
		if (!eligible?.[0] || !excluded?.[0]) throw new Error('Cadastros de teste não foram criados.');
		const generatePdf = vi.fn().mockResolvedValue({ bytes: Uint8Array.of(1), pageCount: 1 });

		try {
			const response = await _createPdfHandler(
				amigoFraternoParticipants,
				generatePdf,
			)({ locals: { user: secretariaUser } });

			expect(response.status).toBe(200);
			expect(generatePdf).toHaveBeenCalledWith(
				expect.arrayContaining([expect.objectContaining({ id: eligible[0].idleitor, photo: null })]),
			);
			expect(generatePdf).not.toHaveBeenCalledWith(
				expect.arrayContaining([expect.objectContaining({ id: excluded[0].idleitor })]),
			);
		} finally {
			await Promise.all([deleteCadastro(eligible[0].idleitor), deleteCadastro(excluded[0].idleitor)]);
		}
	});
});

import { describe, expect, it, vi } from 'vitest';
import { db } from '$lib/server/database/connection';
import { cadastros } from '$lib/server/database/schema';
import { amigoFraternoParticipants } from '$lib/server/pdf/amigo-fraterno/participants';
import { createPdfHandler } from '../../../../../../../src/lib/server/pdf/amigo-fraterno/handler';
import { createTestName, deleteCadastro } from '../../../../../lib/server/models/cadastro/test-support';

const secretariaUser = { roles: 'secretaria:admin' };
vi.mock('$app/server', async () => {
	const { readFile } = await import('node:fs/promises');
	let readCount = 0;
	const assets = [
		await readFile('src/lib/server/pdf/amigo-fraterno/assets/NotoSans-Regular.ttf'),
		await readFile('src/lib/server/pdf/amigo-fraterno/assets/casa-de-guara.png'),
	];
	return { read: () => new Response(assets[readCount++]) };
});

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
			const response = await createPdfHandler(
				amigoFraternoParticipants,
				generatePdf,
			)({
				locals: { user: secretariaUser },
				url: new URL('http://localhost/pdf?nextDrawDate=2026-11-22'),
			});

			expect(response.status).toBe(200);
			expect(generatePdf).toHaveBeenCalledWith(
				expect.arrayContaining([expect.objectContaining({ id: eligible[0].idleitor, photo: null })]),
				'2026-11-22',
			);
			expect(generatePdf).not.toHaveBeenCalledWith(
				expect.arrayContaining([expect.objectContaining({ id: excluded[0].idleitor })]),
			);
		} finally {
			await Promise.all([deleteCadastro(eligible[0].idleitor), deleteCadastro(excluded[0].idleitor)]);
		}
	});
});

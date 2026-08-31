import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

import { db } from '$lib/server/database/connection';
import { cadastroFotos, cadastros } from '$lib/server/database/schema';
import { generateAmigoFraternoPdf } from '$lib/server/pdf/amigo-fraterno/generator';
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

const createJpeg = (width: number, height: number) =>
	sharp({ create: { width, height, channels: 3, background: { r: width % 255, g: height % 255, b: 80 } } })
		.jpeg()
		.toBuffer();

describe('TI-08 amigo fraterno PDF layout', () => {
	it('generates two A4 pages with varied photos and empty slots', async () => {
		const names = Array.from({ length: 7 }, (_, index) => createTestName(`pdf-layout-${index}`));
		const entries = await db
			.insert(cadastros)
			.values(names.map((nome) => ({ nome, amigoFraterno: true, trab: true, desencarnado: false })))
			.returning();
		const photos = await Promise.all([createJpeg(1200, 400), createJpeg(400, 1200), createJpeg(700, 700)]);
		if (entries.length !== 7) throw new Error('Cadastros de teste não foram criados.');
		await db.insert(cadastroFotos).values(
			entries.slice(0, photos.length).map((entry, index) => ({
				cadastroId: entry.idleitor,
				original: photos[index],
				cartao: photos[index],
			})),
		);

		try {
			const response = await createPdfHandler(
				{
					listForPdf: async () =>
						(await amigoFraternoParticipants.listForPdf()).filter(({ id }) =>
							entries.some((entry) => entry.idleitor === id),
						),
				},
				generateAmigoFraternoPdf,
			)({ locals: { user: secretariaUser }, url: new URL('http://localhost/pdf?nextDrawDate=2026-11-22') });
			const document = await PDFDocument.load(await response.bytes());

			expect(response.status).toBe(200);
			expect(document.getPageCount()).toBe(2);
			expect(document.getPages().every((page) => page.getWidth() === 595.28 && page.getHeight() === 841.89)).toBe(
				true,
			);
		} finally {
			await Promise.all(entries.map(({ idleitor }) => deleteCadastro(idleitor)));
		}
	});
});

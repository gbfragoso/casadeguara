import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

import { GET } from '../../../../../../../src/routes/(protected)/secretaria/amigofraterno/pdf/em-branco/+server';
import { secretariaUser } from '../../../../../support/auth';
import { createRequestEvent, invoke } from '../../../../../support/request-event';

vi.mock('$app/server', async () => {
	const { readFile } = await import('node:fs/promises');
	let readCount = 0;
	const assets = [
		await readFile('src/lib/server/pdf/amigo-fraterno/assets/NotoSans-Regular.ttf'),
		await readFile('src/lib/server/brand/casa-de-guara.png'),
	];
	return { read: () => new Response(assets[readCount++ % assets.length]) };
});

describe('amigo fraterno blank PDF endpoint', () => {
	it('downloads a single A4 page of blank cards', async () => {
		const response = await invoke(
			GET,
			createRequestEvent({
				locals: { user: secretariaUser, session: null },
				url: new URL('http://localhost/secretaria/amigofraterno/pdf/em-branco?nextDrawDate=2026-11-22'),
			}),
		);
		const document = await PDFDocument.load(await response.bytes());

		expect(response.status).toBe(200);
		expect(response.headers.get('content-disposition')).toBe('attachment; filename="amigo-fraterno-em-branco.pdf"');
		expect(document.getPageCount()).toBe(1);
		expect(document.getPage(0).getSize()).toMatchObject({ width: 595.28, height: 841.89 });
	});
});

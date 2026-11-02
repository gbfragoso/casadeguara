import { PDFDocument } from 'pdf-lib';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/server', async () => {
	const { readFileSync } = await import('node:fs');
	return { read: (asset: string) => new Response(readFileSync(asset.replace(/^\//, ''))) };
});

import { generateAttendanceListPdf } from '#lib/server/pdf/attendance-list/generator.js';
import { createAttendanceDocument, createWorkers } from './support/attendance-fixtures';

describe('generateAttendanceListPdf', () => {
	it('TU-20 titles the PDF with the typed title', async () => {
		const document = createAttendanceDocument(createWorkers(3));

		const result = await generateAttendanceListPdf(document);

		const pdf = await PDFDocument.load(result.bytes);
		expect(pdf.getTitle()).toBe(document.title);
	});
});

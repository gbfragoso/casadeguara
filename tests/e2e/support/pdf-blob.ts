import type { Page } from '@playwright/test';

export const PDF_SIGNATURE = '%PDF-';

export const PDF_BLOB = { type: 'application/pdf', head: PDF_SIGNATURE } as const;

export const readPdfBlobHead = (page: Page, href: string) =>
	page.evaluate(
		async ({ url, length }) => {
			const blob = await (await fetch(url)).blob();
			return { type: blob.type, head: await blob.slice(0, length).text() };
		},
		{ url: href, length: PDF_SIGNATURE.length },
	);

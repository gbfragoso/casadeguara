import { createPdfStream } from './stream';

export const createPdfResponse = (bytes: Uint8Array, fileName: string) =>
	new Response(createPdfStream(bytes), {
		headers: {
			'cache-control': 'private, no-store',
			'content-disposition': `inline; filename="${fileName}"`,
			'content-type': 'application/pdf',
			'x-content-type-options': 'nosniff',
		},
	});

import { hasSecretariaAccess } from '$lib/server/authorization/cadastros';
import { generateAmigoFraternoPdf } from '$lib/server/amigo-fraterno/pdf-generator';
import { createPdfStream } from '$lib/server/amigo-fraterno/pdf-stream';
import { amigoFraternoParticipants, type AmigoFraternoParticipants } from '$lib/server/amigo-fraterno/participants';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

type ParticipantReader = Pick<AmigoFraternoParticipants, 'listForPdf'>;
type PdfGenerator = typeof generateAmigoFraternoPdf;
type User = { roles: string } | null;
type RequestContext = { locals: { user: User } };

const PDF_HEADERS = {
	'cache-control': 'private, no-store',
	'content-disposition': 'attachment; filename="amigo-fraterno.pdf"',
	'content-type': 'application/pdf',
	'x-content-type-options': 'nosniff',
};
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da secretaria.';

export const _createPdfHandler =
	(participants: ParticipantReader, generatePdf: PdfGenerator) =>
	async ({ locals }: RequestContext) => {
		if (!locals.user || !hasSecretariaAccess(locals.user))
			return json({ message: FORBIDDEN_MESSAGE }, { status: 401 });
		try {
			const currentParticipants = await participants.listForPdf();
			if (!currentParticipants.length) {
				console.warn('amigo_fraterno.pdf_empty');
				return json({ message: 'Não há participantes elegíveis para gerar o PDF.' }, { status: 409 });
			}
			const startedAt = performance.now();
			const { bytes, pageCount } = await generatePdf(currentParticipants);
			console.info('amigo_fraterno.pdf_generated', {
				participantCount: currentParticipants.length,
				pageCount,
				size: bytes.byteLength,
				duration: performance.now() - startedAt,
			});
			return new Response(createPdfStream(bytes), { headers: PDF_HEADERS });
		} catch (error) {
			console.error('amigo_fraterno.pdf_generation_failed', error);
			return json({ message: 'Não foi possível gerar o PDF do Amigo Fraterno.' }, { status: 500 });
		}
	};

export const GET: RequestHandler = _createPdfHandler(amigoFraternoParticipants, generateAmigoFraternoPdf);

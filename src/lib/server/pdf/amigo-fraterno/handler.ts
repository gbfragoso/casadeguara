import { hasSecretariaAccess } from '$lib/server/authorization/cadastros';
import { createPdfStream } from '$lib/server/pdf/amigo-fraterno/stream';
import type { AmigoFraternoPdfParticipant } from '$lib/server/pdf/amigo-fraterno/participant-projections';
import { parseAmigoFraternoPdfRequest } from '$lib/validation/pdf/amigo-fraterno';
import { json } from '@sveltejs/kit';

type ParticipantReader = { listForPdf: () => Promise<AmigoFraternoPdfParticipant[]> };
type PdfGenerator = (
	participants: AmigoFraternoPdfParticipant[],
	nextDrawDate: string,
) => Promise<{ bytes: Uint8Array; pageCount: number }>;
type RequestContext = { locals: { user: { roles: string } | null }; url: URL };

const PDF_HEADERS = {
	'cache-control': 'private, no-store',
	'content-disposition': 'attachment; filename="amigo-fraterno.pdf"',
	'content-type': 'application/pdf',
	'x-content-type-options': 'nosniff',
};
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da secretaria.';

export const createPdfHandler =
	(participants: ParticipantReader, generatePdf: PdfGenerator) =>
	async ({ locals, url }: RequestContext) => {
		if (!locals.user || !hasSecretariaAccess(locals.user))
			return json({ message: FORBIDDEN_MESSAGE }, { status: 401 });
		const request = parseAmigoFraternoPdfRequest(url.searchParams);
		if (!request.success) return json({ message: 'Informe uma data de sorteio válida.' }, { status: 400 });
		try {
			const currentParticipants = await participants.listForPdf();
			if (!currentParticipants.length) {
				console.warn('amigo_fraterno.pdf_empty');
				return json({ message: 'Não há participantes elegíveis para gerar o PDF.' }, { status: 409 });
			}
			const startedAt = performance.now();
			const { bytes, pageCount } = await generatePdf(currentParticipants, request.data.nextDrawDate);
			console.info('amigo_fraterno.pdf_generated', {
				participantCount: currentParticipants.length,
				pageCount,
				size: bytes.byteLength,
				duration: performance.now() - startedAt,
			});
			return new Response(createPdfStream(bytes), { headers: PDF_HEADERS });
		} catch (cause) {
			console.error('amigo_fraterno.pdf_generation_failed', cause);
			return json({ message: 'Não foi possível gerar o PDF do Amigo Fraterno.' }, { status: 500 });
		}
	};

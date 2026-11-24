import { hasSecretariaAccess } from '#lib/server/authorization/cadastros.js';
import { createPdfStream } from '#lib/server/pdf/stream.js';
import type { AmigoFraternoPdfParticipant } from '#lib/server/pdf/amigo-fraterno/participant-projections.js';
import { parseAmigoFraternoPdfRequest } from '#lib/validation/pdf/amigo-fraterno.js';

type ParticipantReader = { listForPdf: () => Promise<AmigoFraternoPdfParticipant[]> };
type PdfGenerator = (
	participants: AmigoFraternoPdfParticipant[],
	nextDrawDate: string,
) => Promise<{ bytes: Uint8Array; pageCount: number }>;
type BlankPdfGenerator = (nextDrawDate: string) => Promise<Uint8Array>;
type RequestContext = { locals: { user: { roles: string } | null }; url: URL };

const UNAUTHENTICATED_MESSAGE = 'Faça login para acessar o sistema da secretaria.';
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da secretaria.';

const createAttachmentResponse = (bytes: Uint8Array, fileName: string) =>
	new Response(createPdfStream(bytes), {
		headers: {
			'cache-control': 'private, no-store',
			'content-disposition': `attachment; filename="${fileName}"`,
			'content-type': 'application/pdf',
			'x-content-type-options': 'nosniff',
		},
	});

const readAuthorizedDrawDate = ({ locals, url }: RequestContext) => {
	if (!locals.user) return Response.json({ message: UNAUTHENTICATED_MESSAGE }, { status: 401 });
	if (!hasSecretariaAccess(locals.user)) return Response.json({ message: FORBIDDEN_MESSAGE }, { status: 403 });
	const request = parseAmigoFraternoPdfRequest(url.searchParams);
	if (!request.success) return Response.json({ message: 'Informe uma data de sorteio válida.' }, { status: 400 });
	return request.data.nextDrawDate;
};

export const createPdfHandler =
	(participants: ParticipantReader, generatePdf: PdfGenerator) => async (context: RequestContext) => {
		const nextDrawDate = readAuthorizedDrawDate(context);
		if (nextDrawDate instanceof Response) return nextDrawDate;
		try {
			const currentParticipants = await participants.listForPdf();
			if (!currentParticipants.length) {
				console.warn('amigo_fraterno.pdf_empty');
				return Response.json({ message: 'Não há participantes elegíveis para gerar o PDF.' }, { status: 409 });
			}
			const startedAt = performance.now();
			const { bytes, pageCount } = await generatePdf(currentParticipants, nextDrawDate);
			console.info('amigo_fraterno.pdf_generated', {
				participantCount: currentParticipants.length,
				pageCount,
				size: bytes.byteLength,
				duration: performance.now() - startedAt,
			});
			return createAttachmentResponse(bytes, 'amigo-fraterno.pdf');
		} catch (cause) {
			console.error('amigo_fraterno.pdf_generation_failed', cause);
			return Response.json({ message: 'Não foi possível gerar o PDF do Amigo Fraterno.' }, { status: 500 });
		}
	};

export const createBlankPdfHandler = (generateBlankPdf: BlankPdfGenerator) => async (context: RequestContext) => {
	const nextDrawDate = readAuthorizedDrawDate(context);
	if (nextDrawDate instanceof Response) return nextDrawDate;
	try {
		const startedAt = performance.now();
		const bytes = await generateBlankPdf(nextDrawDate);
		console.info('amigo_fraterno.blank_pdf_generated', {
			size: bytes.byteLength,
			duration: performance.now() - startedAt,
		});
		return createAttachmentResponse(bytes, 'amigo-fraterno-em-branco.pdf');
	} catch (cause) {
		console.error('amigo_fraterno.blank_pdf_generation_failed', cause);
		return Response.json(
			{ message: 'Não foi possível gerar a página em branco do Amigo Fraterno.' },
			{ status: 500 },
		);
	}
};

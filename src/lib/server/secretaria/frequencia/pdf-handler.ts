import { buildAttendanceFileName } from '#lib/attendance/format.js';
import type { PdfMessageFailure } from '#lib/pdf/request.js';
import { hasSecretariaAccess } from '#lib/server/authorization/cadastros.js';
import type { CadastroModel } from '#lib/server/models/cadastro.js';
import type { AttendanceListDocument } from '#lib/server/pdf/attendance-list/content.js';
import { createPdfResponse } from '#lib/server/pdf/response.js';
import type { GeneratedSheet } from '#lib/server/pdf/sheet/document.js';
import { parseAttendanceListRequest, type AttendanceListRequest } from '#lib/validation/pdf/attendance-list.js';

type AttendancePdfDependencies = {
	workers: Pick<CadastroModel, 'listAttendanceWorkers'>;
	generateList: (document: AttendanceListDocument) => Promise<GeneratedSheet>;
	today: () => string;
};

type AttendancePdfUser = { id: string; roles: string };
type AttendancePdfRequestContext = { locals: { user: AttendancePdfUser | null }; url: URL };

const OPERATION = 'gerar_pdf';
const UNAUTHENTICATED_MESSAGE = 'Usuário não autenticado.';
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da secretaria.';
const NO_WORKERS_MESSAGE = 'Nenhum trabalhador marcado para a lista de frequência. Marque-os em Cadastros.';
const GENERATION_FAILURE_MESSAGE = 'Não foi possível gerar o PDF. Tente novamente.';
const UNAUTHENTICATED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const BAD_REQUEST_STATUS = 400;
const UNPROCESSABLE_STATUS = 422;
const SERVER_ERROR_STATUS = 500;

const reply = (message: string, status: number) => Response.json({ message } satisfies PdfMessageFailure, { status });

const describePeriod = ({ period }: AttendanceListRequest) => ({ inicio: period.start, fim: period.end });

const serveAttendanceList = async (
	{ workers, generateList, today }: AttendancePdfDependencies,
	request: AttendanceListRequest,
): Promise<Response> => {
	const startedAt = performance.now();
	const names = await workers.listAttendanceWorkers();
	if (names.length === 0) {
		console.warn('secretaria.frequencia.pdf_vazio', describePeriod(request));
		return reply(NO_WORKERS_MESSAGE, UNPROCESSABLE_STATUS);
	}

	const list = await generateList({
		title: request.title,
		dates: request.dates,
		generatedOn: today(),
		workers: names,
	});
	console.info('secretaria.frequencia.pdf_gerado', {
		...describePeriod(request),
		trabalhadores: names.length,
		datas: request.dates.length,
		paginas: list.pageCount,
		bytes: list.bytes.byteLength,
		duracaoMs: performance.now() - startedAt,
	});
	return createPdfResponse(list.bytes, buildAttendanceFileName(request.period));
};

export const createAttendancePdfHandler =
	(dependencies: AttendancePdfDependencies) =>
	async ({ locals, url }: AttendancePdfRequestContext) => {
		const { user } = locals;
		if (!user) return reply(UNAUTHENTICATED_MESSAGE, UNAUTHENTICATED_STATUS);
		if (!hasSecretariaAccess(user)) return reply(FORBIDDEN_MESSAGE, FORBIDDEN_STATUS);

		const parsed = parseAttendanceListRequest(url.searchParams);
		if (!parsed.success) return reply(parsed.issues[0].message, BAD_REQUEST_STATUS);

		try {
			return await serveAttendanceList(dependencies, parsed.data);
		} catch (cause) {
			console.error('secretaria.frequencia.falha', {
				operacao: OPERATION,
				...describePeriod(parsed.data),
				error: cause,
			});
			return reply(GENERATION_FAILURE_MESSAGE, SERVER_ERROR_STATUS);
		}
	};

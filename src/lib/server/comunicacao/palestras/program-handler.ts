import { hasComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import type { TalkProgramDocument } from '#lib/server/pdf/talk-program/content.js';
import type { GeneratedProgram } from '#lib/server/pdf/talk-program/generator.js';
import { buildProgramFileName, describeEmptyProgram } from '#lib/talks/program/format.js';
import { findProgramMonth, readMonthRange, type ProgramMonth } from '#lib/talks/program/months.js';
import { checkProgramReadiness, type ProgramPendency } from '#lib/talks/program/readiness.js';

type TalkProgramDependencies = {
	talks: Pick<PalestraModel, 'listMonthProgram'>;
	generateProgram: (document: TalkProgramDocument) => Promise<GeneratedProgram>;
	today: () => string;
};

type ProgramUser = { id: string; roles: string };
type ProgramRequestContext = { locals: { user: ProgramUser | null }; url: URL };
type ProgramRequest = { month: ProgramMonth; generatedOn: string; actorId: string; startedAt: number };

const OPERATION = 'gerar_programacao';
const UNAUTHENTICATED_MESSAGE = 'Usuário não autenticado.';
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da comunicação.';
const INVALID_MONTH_MESSAGE = 'Escolha o mês atual ou o próximo.';
const PENDING_TALKS_MESSAGE = 'Complete estas palestras no quadro para gerar a programação:';
const GENERATION_FAILURE_MESSAGE = 'Não foi possível gerar a programação. Tente novamente.';
const UNPROCESSABLE_STATUS = 422;

const reply = (message: string, status: number, pendencias: ProgramPendency[] = []) =>
	Response.json({ message, pendencias }, { status });

const createProgramResponse = ({ bytes }: GeneratedProgram, month: ProgramMonth) =>
	new Response(new Uint8Array(bytes), {
		headers: {
			'cache-control': 'private, no-store',
			'content-disposition': `inline; filename="${buildProgramFileName(month)}"`,
			'content-type': 'application/pdf',
			'x-content-type-options': 'nosniff',
		},
	});

const logBlockedProgram = ({ month, actorId }: ProgramRequest, motivo: string, pendencias: number) =>
	console.warn('comunicacao.palestras.programacao_bloqueada', { mes: month.key, motivo, pendencias, actorId });

const serveProgram = async (
	{ talks, generateProgram }: TalkProgramDependencies,
	request: ProgramRequest,
): Promise<Response> => {
	const { month, generatedOn, actorId } = request;
	const readiness = checkProgramReadiness(await talks.listMonthProgram(readMonthRange(month)));
	if (readiness.status === 'vazia') {
		logBlockedProgram(request, 'mes-vazio', 0);
		return reply(describeEmptyProgram(month), UNPROCESSABLE_STATUS);
	}
	if (readiness.status === 'pendente') {
		logBlockedProgram(request, 'pendencias', readiness.pendencias.length);
		return reply(PENDING_TALKS_MESSAGE, UNPROCESSABLE_STATUS, readiness.pendencias);
	}

	const program = await generateProgram({ month, generatedOn, talks: readiness.talks });
	console.info('comunicacao.palestras.programacao_gerada', {
		mes: month.key,
		quantidade: readiness.talks.length,
		paginas: program.pageCount,
		bytes: program.bytes.byteLength,
		duracaoMs: performance.now() - request.startedAt,
		actorId,
	});
	return createProgramResponse(program, month);
};

export const createTalkProgramHandler =
	(dependencies: TalkProgramDependencies) =>
	async ({ locals, url }: ProgramRequestContext) => {
		const { user } = locals;
		if (!user) return reply(UNAUTHENTICATED_MESSAGE, 401);
		if (!hasComunicacaoAccess(user)) return reply(FORBIDDEN_MESSAGE, 403);

		const generatedOn = dependencies.today();
		const month = findProgramMonth(url.searchParams.get('mes'), generatedOn);
		if (!month) return reply(INVALID_MONTH_MESSAGE, 400);

		const request = { month, generatedOn, actorId: user.id, startedAt: performance.now() };
		try {
			return await serveProgram(dependencies, request);
		} catch (cause) {
			console.error('comunicacao.palestras.falha', { operacao: OPERATION, mes: month.key, error: cause });
			return reply(GENERATION_FAILURE_MESSAGE, 500);
		}
	};

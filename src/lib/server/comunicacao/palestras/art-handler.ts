import { hasComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { TalkArtSource } from '#lib/server/image/talk-art/content.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import { buildTalkArtFileName } from '#lib/talks/art/format.js';
import { checkTalkArtReadiness, type ReadyTalk } from '#lib/talks/art/readiness.js';
import { talkTargetSchema, type TalkTarget } from '#lib/validation/comunicacao/palestras.js';

import { readTalkFailureMessage } from './failures';

type TalkArtDependencies = {
	talks: Pick<PalestraModel, 'findArtSource'>;
	generateArt: (talk: ReadyTalk<TalkArtSource>) => Promise<Uint8Array>;
};

type ArtUser = { id: string; roles: string };
type ArtRequestContext = { locals: { user: ArtUser | null }; params: { id: string }; url: URL };
type ArtRequest = { target: TalkTarget; actorId: string; startedAt: number };

const OPERATION = 'gerar_arte';
const UNAUTHENTICATED_MESSAGE = 'Usuário não autenticado.';
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da comunicação.';
const INVALID_INPUT_MESSAGE = 'Dados inválidos.';
const GENERATION_FAILURE_MESSAGE = 'Não foi possível gerar a arte. Tente novamente.';

const reply = (message: string, status: number) => Response.json({ message }, { status });

const createArtResponse = (png: Uint8Array, { data, horario }: TalkArtSource) =>
	new Response(new Uint8Array(png), {
		headers: {
			'cache-control': 'private, no-store',
			'content-disposition': `inline; filename="${buildTalkArtFileName(data, horario)}"`,
			'content-type': 'image/png',
			'x-content-type-options': 'nosniff',
		},
	});

const rejectStaleVersion = (palestraId: number, actorId: string) => {
	console.warn('comunicacao.palestras.conflito', { operacao: OPERATION, palestraId, actorId });
	return reply(readTalkFailureMessage('conflito'), 409);
};

const generateReadyArt = async (
	generateArt: TalkArtDependencies['generateArt'],
	source: TalkArtSource,
	request: ArtRequest,
) => {
	const readiness = checkTalkArtReadiness(source);
	const details = { palestraId: source.id, actorId: request.actorId };
	if (!readiness.ready) {
		console.warn('comunicacao.palestras.arte_bloqueada', { ...details, motivo: readiness.blocker.codigo });
		return reply(readiness.blocker.mensagem, 422);
	}

	const png = await generateArt(readiness.talk);
	const duracaoMs = performance.now() - request.startedAt;
	console.info('comunicacao.palestras.arte_gerada', { ...details, duracaoMs, bytes: png.byteLength });
	return createArtResponse(png, source);
};

const serveArt = async ({ talks, generateArt }: TalkArtDependencies, request: ArtRequest) => {
	const source = await talks.findArtSource(request.target.id);
	if (!source) return reply(readTalkFailureMessage('inexistente'), 404);
	if (source.versao !== request.target.versao) return rejectStaleVersion(source.id, request.actorId);

	return generateReadyArt(generateArt, source, request);
};

export const createTalkArtHandler =
	(dependencies: TalkArtDependencies) =>
	async ({ locals, params, url }: ArtRequestContext) => {
		const { user } = locals;
		if (!user) return reply(UNAUTHENTICATED_MESSAGE, 401);
		if (!hasComunicacaoAccess(user)) return reply(FORBIDDEN_MESSAGE, 403);

		const parsed = talkTargetSchema.safeParse({ id: params.id, versao: url.searchParams.get('versao') });
		if (!parsed.success) return reply(INVALID_INPUT_MESSAGE, 400);

		const request = { target: parsed.data, actorId: user.id, startedAt: performance.now() };
		try {
			return await serveArt(dependencies, request);
		} catch (cause) {
			console.error('comunicacao.palestras.falha', {
				operacao: OPERATION,
				palestraId: parsed.data.id,
				error: cause,
			});
			return reply(GENERATION_FAILURE_MESSAGE, 500);
		}
	};

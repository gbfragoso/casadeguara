import { hasComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import { createPhotoResponse } from '#lib/server/image/photo-response.js';
import type { PalestranteModel } from '#lib/server/models/palestrante.js';
import type { SpeakerPhotoVariant } from '#lib/server/models/palestrante-photo.js';

type User = { roles: string } | null;
type RequestContext = { locals: { user: User }; params: { id: string } };

const UNAUTHENTICATED_MESSAGE = 'Usuário não autenticado.';
const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da comunicação.';
const READ_FAILURE_MESSAGE = 'Falha ao recuperar a foto do palestrante.';

export const createSpeakerPhotoHandler =
	({ speakers }: { speakers: Pick<PalestranteModel, 'getPhoto'> }, variant: SpeakerPhotoVariant) =>
	async ({ locals, params }: RequestContext) => {
		if (!locals.user) return Response.json({ message: UNAUTHENTICATED_MESSAGE }, { status: 401 });
		if (!hasComunicacaoAccess(locals.user)) return Response.json({ message: FORBIDDEN_MESSAGE }, { status: 403 });

		const palestranteId = Number(params.id);
		try {
			const photo = await speakers.getPhoto(palestranteId, variant);
			if (!photo) return Response.json({ message: 'Foto não encontrada.' }, { status: 404 });

			return createPhotoResponse(photo);
		} catch (cause) {
			console.error('comunicacao.palestrantes.falha', { operacao: 'ler_foto', palestranteId, error: cause });
			return Response.json({ message: READ_FAILURE_MESSAGE }, { status: 500 });
		}
	};

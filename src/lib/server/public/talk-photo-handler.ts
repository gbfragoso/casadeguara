import { createPhotoResponse } from '#lib/server/image/photo-response.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import { readUpcomingTalkCutoff } from '#lib/server/models/palestra-public.js';

type PhotoDependencies = { talks: Pick<PalestraModel, 'findPublicSpeakerPhoto'>; clock: () => Date };
type RequestContext = { params: { id: string } };

const NOT_FOUND_MESSAGE = 'Foto não encontrada.';
const PUBLIC_PHOTO_CACHE_CONTROL = 'public, max-age=3600';
const READ_FAILURE_MESSAGE = 'Falha ao recuperar a foto do palestrante.';

export const createTalkPhotoHandler =
	({ talks, clock }: PhotoDependencies) =>
	async ({ params }: RequestContext) => {
		const palestraId = Number(params.id);
		try {
			const photo = await talks.findPublicSpeakerPhoto(palestraId, readUpcomingTalkCutoff(clock()));
			if (!photo) return Response.json({ message: NOT_FOUND_MESSAGE }, { status: 404 });

			return createPhotoResponse(photo, PUBLIC_PHOTO_CACHE_CONTROL);
		} catch (cause) {
			console.error('inicio.palestras.falha', { operacao: 'ler_foto', palestraId, error: cause });
			return Response.json({ message: READ_FAILURE_MESSAGE }, { status: 500 });
		}
	};

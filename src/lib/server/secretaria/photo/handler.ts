import { hasSecretariaAccess } from '#lib/server/authorization/cadastros.js';
import { createPhotoResponse } from '#lib/server/image/photo-response.js';

type User = { roles: string } | null;
type RequestContext = { locals: { user: User }; params: { id: string } };
type PhotoReader = (id: number) => Promise<Uint8Array | null | undefined>;

const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da secretaria.';

export const createPhotoHandler =
	(readPhoto: PhotoReader) =>
	async ({ locals, params }: RequestContext) => {
		if (!locals.user || !hasSecretariaAccess(locals.user))
			return Response.json({ message: FORBIDDEN_MESSAGE }, { status: 401 });

		try {
			const photo = await readPhoto(Number(params.id));
			if (!photo) return Response.json({ message: 'Foto não encontrada.' }, { status: 404 });

			return createPhotoResponse(photo);
		} catch {
			console.error('Falha ao recuperar a foto do trabalhador.');
			return Response.json({ message: 'Falha ao recuperar a foto do trabalhador.' }, { status: 500 });
		}
	};

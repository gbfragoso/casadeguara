import { hasSecretariaAccess } from '$lib/server/authorization/cadastros';
import { json } from '@sveltejs/kit';

type User = { roles: string } | null;
type RequestContext = { locals: { user: User }; params: { id: string } };
type PhotoReader = (id: number) => Promise<Uint8Array | null | undefined>;

const FORBIDDEN_MESSAGE = 'Usuário não possui acesso ao sistema da secretaria.';
const PHOTO_HEADERS = {
	'cache-control': 'private, no-store',
	'content-disposition': 'inline',
	'content-type': 'image/jpeg',
	'x-content-type-options': 'nosniff',
};

const toResponseBody = (photo: Uint8Array) => {
	const bytes = new Uint8Array(photo.byteLength);
	bytes.set(photo);
	return bytes.buffer;
};

export const createPhotoHandler =
	(readPhoto: PhotoReader) =>
	async ({ locals, params }: RequestContext) => {
		if (!locals.user || !hasSecretariaAccess(locals.user))
			return json({ message: FORBIDDEN_MESSAGE }, { status: 401 });

		try {
			const photo = await readPhoto(Number(params.id));
			if (!photo) return json({ message: 'Foto não encontrada.' }, { status: 404 });

			return new Response(toResponseBody(photo), { headers: PHOTO_HEADERS });
		} catch {
			console.error('Falha ao recuperar a foto do trabalhador.');
			return json({ message: 'Falha ao recuperar a foto do trabalhador.' }, { status: 500 });
		}
	};

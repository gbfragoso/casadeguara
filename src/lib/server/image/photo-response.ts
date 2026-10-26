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

export const createPhotoResponse = (photo: Uint8Array): Response =>
	new Response(toResponseBody(photo), { headers: PHOTO_HEADERS });

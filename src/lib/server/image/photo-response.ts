const PRIVATE_CACHE_CONTROL = 'private, no-store';

const PHOTO_HEADERS = {
	'content-disposition': 'inline',
	'content-type': 'image/jpeg',
	'x-content-type-options': 'nosniff',
};

const toResponseBody = (photo: Uint8Array) => {
	const bytes = new Uint8Array(photo.byteLength);
	bytes.set(photo);
	return bytes.buffer;
};

export const createPhotoResponse = (photo: Uint8Array, cacheControl = PRIVATE_CACHE_CONTROL): Response =>
	new Response(toResponseBody(photo), { headers: { 'cache-control': cacheControl, ...PHOTO_HEADERS } });

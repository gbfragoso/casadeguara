export const INSTITUTION_NAME = 'Grupo Espírita Casa de Guará';
export const INSTITUTION_ADDRESS = 'Rua Major Dórea, 86, Castália, Itabuna-BA';
export const INSTITUTION_POSTAL_CODE = '45603-184';
export const INSTITUTION_EMAIL = 'contato@casadeguara.org';
export const INSTITUTION_INSTAGRAM_URL = 'https://www.instagram.com/casadeguara/';
export const INSTITUTION_YOUTUBE_URL = 'https://www.youtube.com/channel/UCFz1gRHG5bq750Nma0Ttc4w';
export const INSTITUTION_COORDINATES = { latitude: -14.7818467, longitude: -39.2738578 } as const;

const DIRECTIONS_BASE_URL = 'https://www.google.com/maps/dir/?api=1&destination=';
const MAP_HALF_SPAN_DEGREES = 0.004;
const MAP_ZOOM = 17;

const { latitude, longitude } = INSTITUTION_COORDINATES;
const mapBoundingBox = [
	longitude - MAP_HALF_SPAN_DEGREES,
	latitude - MAP_HALF_SPAN_DEGREES,
	longitude + MAP_HALF_SPAN_DEGREES,
	latitude + MAP_HALF_SPAN_DEGREES,
].join(',');

export const INSTITUTION_MAP_EMBED_URL = `https://www.openstreetmap.org/export/embed.html?${new URLSearchParams({
	bbox: mapBoundingBox,
	layer: 'mapnik',
	marker: `${latitude},${longitude}`,
})}`;

export const INSTITUTION_MAP_URL = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${MAP_ZOOM}/${latitude}/${longitude}`;

export const INSTITUTION_DIRECTIONS_URL = `${DIRECTIONS_BASE_URL}${encodeURIComponent(
	`${INSTITUTION_ADDRESS}, ${INSTITUTION_POSTAL_CODE}`,
)}`;

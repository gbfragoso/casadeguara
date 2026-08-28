import sharp, { type Metadata } from 'sharp';

import type { PhotoUploadInput } from '$lib/validation/cadastros/foto';

const MINIMUM_PHOTO_SIDE = 300;
export const MAXIMUM_PHOTO_PIXELS = 24_000_000;
export const PHOTO_JPEG_QUALITY = 82;
const MAXIMUM_PHOTO_SIDE = 1_200;

export class InvalidPhotoError extends Error {
	constructor(readonly reason: PhotoRejectionReason) {
		super('A foto deve ser JPEG ou PNG, ter até 3 MiB e pelo menos 300 × 300 pixels.');
		this.name = 'InvalidPhotoError';
	}
}

type PhotoRejectionReason = 'format' | 'dimensions' | 'decode';

export type NormalizedPhoto = {
	bytes: Uint8Array;
	contentType: 'image/jpeg';
	width: number;
	height: number;
};

const isSupportedPhoto = (format: string | undefined) => format === 'jpeg' || format === 'png';

const getMetadataRejectionReason = (metadata: Metadata): PhotoRejectionReason | undefined => {
	const pixels = metadata.width * metadata.height;

	if (!isSupportedPhoto(metadata.format) || metadata.pages !== undefined) return 'format';
	if (metadata.width < MINIMUM_PHOTO_SIDE || metadata.height < MINIMUM_PHOTO_SIDE) return 'dimensions';
	if (pixels > MAXIMUM_PHOTO_PIXELS) return 'dimensions';
};

const normalizePhotoBytes = async (input: Uint8Array): Promise<NormalizedPhoto> => {
	const { data, info } = await sharp(input, { limitInputPixels: MAXIMUM_PHOTO_PIXELS })
		.autoOrient()
		.flatten({ background: '#ffffff' })
		.resize(MAXIMUM_PHOTO_SIDE, MAXIMUM_PHOTO_SIDE, { fit: 'inside', withoutEnlargement: true })
		.jpeg({ quality: PHOTO_JPEG_QUALITY })
		.toBuffer({ resolveWithObject: true });

	return { bytes: data, contentType: 'image/jpeg', width: info.width, height: info.height };
};

export const normalizePhotoSource = async (file: PhotoUploadInput['foto']): Promise<NormalizedPhoto> => {
	try {
		const input = new Uint8Array(await file.arrayBuffer());
		const metadata = await sharp(input, { animated: true, limitInputPixels: false }).metadata();
		const rejectionReason = getMetadataRejectionReason(metadata);
		if (rejectionReason) throw new InvalidPhotoError(rejectionReason);
		return await normalizePhotoBytes(input);
	} catch (error) {
		const rejection = error instanceof InvalidPhotoError ? error : new InvalidPhotoError('decode');
		console.warn('amigo_fraterno.photo_rejected', { reason: rejection.reason });
		throw rejection;
	}
};

export const normalizePhoto = ({ foto }: PhotoUploadInput): Promise<NormalizedPhoto> => normalizePhotoSource(foto);

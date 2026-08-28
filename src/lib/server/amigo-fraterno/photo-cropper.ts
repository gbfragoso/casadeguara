import sharp from 'sharp';

import { PHOTO_FRAME } from '$lib/amigo-fraterno/card-geometry';
import { createCropRectangle, type ImageSize, type PhotoPositionInput } from '$lib/amigo-fraterno/photo-crop';

import { MAXIMUM_PHOTO_PIXELS, PHOTO_JPEG_QUALITY } from './photo-normalizer';

const CARD_PHOTO_ASPECT_RATIO = PHOTO_FRAME.outputWidth / PHOTO_FRAME.outputHeight;

const readSourceSize = async (source: Uint8Array): Promise<ImageSize> => {
	const metadata = await sharp(source, { limitInputPixels: MAXIMUM_PHOTO_PIXELS }).metadata();
	return { width: metadata.width, height: metadata.height };
};

export const createCardPhoto = async (source: Uint8Array, position: PhotoPositionInput): Promise<Uint8Array> => {
	const sourceSize = await readSourceSize(source);
	const crop = createCropRectangle(sourceSize, position, CARD_PHOTO_ASPECT_RATIO);
	return sharp(source, { limitInputPixels: MAXIMUM_PHOTO_PIXELS })
		.extract(crop)
		.resize(PHOTO_FRAME.outputWidth, PHOTO_FRAME.outputHeight, { fit: 'fill' })
		.jpeg({ quality: PHOTO_JPEG_QUALITY })
		.toBuffer();
};

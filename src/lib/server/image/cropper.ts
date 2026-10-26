import sharp from 'sharp';

import { PHOTO_FRAME } from '#lib/image/geometry/card.js';
import { PHOTO_THUMBNAIL_SIDE, SQUARE_PHOTO_FRAME } from '#lib/image/geometry/square.js';
import { createCropRectangle, type ImageSize, type PhotoPositionInput } from '#lib/image/crop/rectangle.js';

import { MAXIMUM_PHOTO_PIXELS, PHOTO_JPEG_QUALITY } from './normalizer';

export type OutputFrame = { outputWidth: number; outputHeight: number };

const readSourceSize = async (source: Uint8Array): Promise<ImageSize> => {
	const metadata = await sharp(source, { limitInputPixels: MAXIMUM_PHOTO_PIXELS }).metadata();
	return { width: metadata.width, height: metadata.height };
};

export const createFramedPhoto = async (
	source: Uint8Array,
	position: PhotoPositionInput,
	frame: OutputFrame,
): Promise<Uint8Array> => {
	const sourceSize = await readSourceSize(source);
	const crop = createCropRectangle(sourceSize, position, frame.outputWidth / frame.outputHeight);
	return sharp(source, { limitInputPixels: MAXIMUM_PHOTO_PIXELS })
		.extract(crop)
		.resize(frame.outputWidth, frame.outputHeight, { fit: 'fill' })
		.jpeg({ quality: PHOTO_JPEG_QUALITY })
		.toBuffer();
};

export const createCardPhoto = (source: Uint8Array, position: PhotoPositionInput): Promise<Uint8Array> =>
	createFramedPhoto(source, position, PHOTO_FRAME);

export const createSquarePhoto = (source: Uint8Array, position: PhotoPositionInput): Promise<Uint8Array> =>
	createFramedPhoto(source, position, SQUARE_PHOTO_FRAME);

export const createThumbnail = (square: Uint8Array): Promise<Uint8Array> =>
	sharp(square, { limitInputPixels: MAXIMUM_PHOTO_PIXELS })
		.resize(PHOTO_THUMBNAIL_SIDE, PHOTO_THUMBNAIL_SIDE, { fit: 'cover' })
		.jpeg({ quality: PHOTO_JPEG_QUALITY })
		.toBuffer();

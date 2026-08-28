export type ImageSize = { width: number; height: number };

export type PhotoPositionInput = {
	focalX: number;
	focalY: number;
	zoom: number;
};

export type CropRectangle = {
	left: number;
	top: number;
	width: number;
	height: number;
};

const MINIMUM_ZOOM = 1;
const MAXIMUM_ZOOM = 3;

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

const validateCropInput = (source: ImageSize, position: PhotoPositionInput, frameAspectRatio: number) => {
	const values = [source.width, source.height, position.focalX, position.focalY, position.zoom, frameAspectRatio];
	if (!values.every(Number.isFinite)) throw new RangeError('Crop values must be finite numbers.');
	if (Math.min(source.width, source.height, frameAspectRatio) <= 0)
		throw new RangeError('Crop dimensions must be positive.');
};

const createCoverSize = (source: ImageSize, frameAspectRatio: number): ImageSize => {
	if (source.width / source.height > frameAspectRatio)
		return { width: source.height * frameAspectRatio, height: source.height };
	return { width: source.width, height: source.width / frameAspectRatio };
};

export const createCropRectangle = (
	source: ImageSize,
	position: PhotoPositionInput,
	frameAspectRatio: number,
): CropRectangle => {
	validateCropInput(source, position, frameAspectRatio);
	const zoom = clamp(position.zoom, MINIMUM_ZOOM, MAXIMUM_ZOOM);
	const cover = createCoverSize(source, frameAspectRatio);
	const width = Math.max(1, Math.round(cover.width / zoom));
	const height = Math.max(1, Math.round(cover.height / zoom));
	const focalX = clamp(position.focalX, 0, 1);
	const focalY = clamp(position.focalY, 0, 1);
	const left = Math.round(clamp(focalX * source.width - width / 2, 0, source.width - width));
	const top = Math.round(clamp(focalY * source.height - height / 2, 0, source.height - height));
	return { left, top, width, height };
};

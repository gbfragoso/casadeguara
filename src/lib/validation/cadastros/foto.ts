import { File } from 'node:buffer';

import { z } from 'zod';

export const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
export const INVALID_PHOTO_MESSAGE = 'A foto deve ser JPEG ou PNG, ter até 3 MiB e pelo menos 300 × 300 pixels.';
export const PHOTO_POSITION_MESSAGE = 'O enquadramento da foto é inválido.';
const PHOTO_CONTENT_TYPES = ['image/jpeg', 'image/png'] as const;

const photoSchema = z
	.instanceof(File, { error: INVALID_PHOTO_MESSAGE })
	.refine((file) => PHOTO_CONTENT_TYPES.includes(file.type as (typeof PHOTO_CONTENT_TYPES)[number]), {
		message: INVALID_PHOTO_MESSAGE,
	})
	.refine((file) => file.size > 0 && file.size <= PHOTO_MAX_BYTES, { message: INVALID_PHOTO_MESSAGE });

const positionField = (minimum: number, maximum: number) =>
	z
		.string({ error: PHOTO_POSITION_MESSAGE })
		.trim()
		.min(1, PHOTO_POSITION_MESSAGE)
		.transform(Number)
		.pipe(
			z
				.number({ error: PHOTO_POSITION_MESSAGE })
				.finite(PHOTO_POSITION_MESSAGE)
				.min(minimum, PHOTO_POSITION_MESSAGE)
				.max(maximum, PHOTO_POSITION_MESSAGE),
		);

export const photoPositionSchema = z.strictObject(
	{
		focalX: positionField(0, 1),
		focalY: positionField(0, 1),
		zoom: positionField(1, 3),
	},
	PHOTO_POSITION_MESSAGE,
);

export const photoUploadSchema = z.strictObject(
	{
		foto: photoSchema,
		focalX: positionField(0, 1),
		focalY: positionField(0, 1),
		zoom: positionField(1, 3),
	},
	INVALID_PHOTO_MESSAGE,
);
export type PhotoUploadInput = { foto: z.output<typeof photoSchema> };
export type PhotoPositionInput = z.output<typeof photoPositionSchema>;
export type PhotoUploadFormInput = z.output<typeof photoUploadSchema>;

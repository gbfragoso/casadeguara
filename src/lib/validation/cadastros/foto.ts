import { File } from 'node:buffer';

import { z } from 'zod';

export const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
export const INVALID_PHOTO_MESSAGE = 'A foto deve ser JPEG ou PNG, ter até 3 MiB e pelo menos 300 × 300 pixels.';
const PHOTO_CONTENT_TYPES = ['image/jpeg', 'image/png'] as const;

const photoSchema = z
	.instanceof(File, { error: INVALID_PHOTO_MESSAGE })
	.refine((file) => PHOTO_CONTENT_TYPES.includes(file.type as (typeof PHOTO_CONTENT_TYPES)[number]), {
		message: INVALID_PHOTO_MESSAGE,
	})
	.refine((file) => file.size > 0 && file.size <= PHOTO_MAX_BYTES, { message: INVALID_PHOTO_MESSAGE });

export const photoUploadSchema = z.strictObject({ foto: photoSchema }, INVALID_PHOTO_MESSAGE);
export type PhotoUploadInput = z.output<typeof photoUploadSchema>;

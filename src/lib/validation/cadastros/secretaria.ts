import { z } from 'zod';

import { createOptionalBirthdaySchema, createSearchNameSchema } from './common';
import { createPersonalRegistrationFields } from './personal';
import { normalizeSensitiveUpdate, sensitiveUpdateFields, validateSensitiveUpdate } from './sensitive';

const secretariaFields = {
	...createPersonalRegistrationFields('trabalhador'),
	aniversario: createOptionalBirthdaySchema().optional(),
};

export const secretariaSearchSchema = z.strictObject(
	{ nome: createSearchNameSchema('trabalhador') },
	'Dados do cadastro inválidos.',
);
export const secretariaCreateSchema = z.strictObject(secretariaFields, 'Dados do cadastro inválidos.');
export const secretariaUpdateSchema = z
	.strictObject({ ...secretariaFields, ...sensitiveUpdateFields }, 'Dados do cadastro inválidos.')
	.superRefine(validateSensitiveUpdate)
	.transform(normalizeSensitiveUpdate);

export type SecretariaSearchInput = z.output<typeof secretariaSearchSchema>;
export type SecretariaCreateInput = z.output<typeof secretariaCreateSchema>;
export type SecretariaUpdateInput = z.output<typeof secretariaUpdateSchema>;

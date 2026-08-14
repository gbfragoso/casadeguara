import { z } from 'zod';

import { createCheckboxSchema, createSearchNameSchema } from './common';
import { createPersonalRegistrationFields } from './personal';
import { normalizeSensitiveUpdate, sensitiveUpdateFields, validateSensitiveUpdate } from './sensitive';

const bibliotecaFields = {
	...createPersonalRegistrationFields('leitor'),
	status: createCheckboxSchema('Status inválido.').optional(),
};

export const bibliotecaSearchSchema = z.strictObject(
	{ nome: createSearchNameSchema('leitor') },
	'Dados do cadastro inválidos.',
);
export const bibliotecaCreateSchema = z.strictObject(bibliotecaFields, 'Dados do cadastro inválidos.');
export const bibliotecaUpdateSchema = z
	.strictObject({ ...bibliotecaFields, ...sensitiveUpdateFields }, 'Dados do cadastro inválidos.')
	.superRefine(validateSensitiveUpdate)
	.transform(normalizeSensitiveUpdate);

export type BibliotecaSearchInput = z.output<typeof bibliotecaSearchSchema>;
export type BibliotecaCreateInput = z.output<typeof bibliotecaCreateSchema>;
export type BibliotecaUpdateInput = z.output<typeof bibliotecaUpdateSchema>;

import { z } from 'zod';

import {
	createCheckboxSchema,
	createOptionalPhoneSchema,
	createRequiredNameSchema,
	createSearchNameSchema,
} from './common';

const tesourariaFields = {
	nome: createRequiredNameSchema('contribuinte'),
	telefone: createOptionalPhoneSchema('Telefone').optional(),
	trab: createCheckboxSchema('Trabalhador inválido.').optional(),
};

export const tesourariaSearchSchema = z.strictObject(
	{ nome: createSearchNameSchema('contribuinte') },
	'Dados do cadastro inválidos.',
);
export const tesourariaCreateSchema = z.strictObject(tesourariaFields, 'Dados do cadastro inválidos.');
export const tesourariaUpdateSchema = z.strictObject(tesourariaFields, 'Dados do cadastro inválidos.');

export type TesourariaSearchInput = z.output<typeof tesourariaSearchSchema>;
export type TesourariaCreateInput = z.output<typeof tesourariaCreateSchema>;
export type TesourariaUpdateInput = z.output<typeof tesourariaUpdateSchema>;

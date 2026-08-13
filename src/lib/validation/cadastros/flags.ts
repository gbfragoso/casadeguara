import { z } from 'zod';

import { createCheckboxSchema } from './common';

const INVALID_UPDATE_MESSAGE = 'Cadastro ou campo de atualização inválido.';
const registrationIdSchema = z
	.string({ error: INVALID_UPDATE_MESSAGE })
	.trim()
	.regex(/^[1-9]\d*$/, INVALID_UPDATE_MESSAGE)
	.transform(Number)
	.refine((value) => value <= 32_767, INVALID_UPDATE_MESSAGE);

export const secretariaFlagsSchema = z.strictObject(
	{
		id: registrationIdSchema,
		field: z.enum(['trab', 'frequencia', 'desencarnado'], { error: INVALID_UPDATE_MESSAGE }),
		value: createCheckboxSchema(INVALID_UPDATE_MESSAGE),
	},
	INVALID_UPDATE_MESSAGE,
);

export type SecretariaFlagsInput = z.output<typeof secretariaFlagsSchema>;

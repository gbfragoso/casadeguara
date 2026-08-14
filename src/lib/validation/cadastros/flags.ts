import { z } from 'zod';

const INVALID_UPDATE_MESSAGE = 'Cadastro ou campo de atualização inválido.';
const MAX_CADASTRO_ID = 32_767;
const registrationIdSchema = z
	.number({ error: INVALID_UPDATE_MESSAGE })
	.int(INVALID_UPDATE_MESSAGE)
	.min(1, INVALID_UPDATE_MESSAGE)
	.max(MAX_CADASTRO_ID, INVALID_UPDATE_MESSAGE);

export const secretariaFlagsSchema = z.strictObject(
	{
		id: registrationIdSchema,
		field: z.enum(['trab', 'frequencia', 'desencarnado'], { error: INVALID_UPDATE_MESSAGE }),
		value: z.boolean({ error: INVALID_UPDATE_MESSAGE }),
	},
	INVALID_UPDATE_MESSAGE,
);

export type SecretariaFlagsInput = z.output<typeof secretariaFlagsSchema>;

import type { z } from 'zod';

import { createCheckboxSchema } from './common';
import { CPF_INVALID_MESSAGE, RG_INVALID_MESSAGE } from './identifiers';

export const sensitiveUpdateFields = {
	removeCpf: createCheckboxSchema(CPF_INVALID_MESSAGE)
		.optional()
		.transform((value) => value ?? false),
	removeRg: createCheckboxSchema(RG_INVALID_MESSAGE)
		.optional()
		.transform((value) => value ?? false),
};

type SensitiveUpdateInput = {
	cpf?: string;
	rg?: string;
	removeCpf: boolean;
	removeRg: boolean;
};

type SensitiveUpdateOutput = {
	cpf?: string | null;
	rg?: string | null;
};

export const validateSensitiveUpdate = (data: SensitiveUpdateInput, context: z.RefinementCtx) => {
	if (data.removeCpf && data.cpf) context.addIssue({ code: 'custom', message: CPF_INVALID_MESSAGE, path: ['cpf'] });
	if (data.removeRg && data.rg) context.addIssue({ code: 'custom', message: RG_INVALID_MESSAGE, path: ['rg'] });
};

export const normalizeSensitiveUpdate = <Fields extends SensitiveUpdateInput>(
	data: Fields,
): Omit<Fields, 'cpf' | 'rg' | 'removeCpf' | 'removeRg'> & SensitiveUpdateOutput => {
	const { cpf, rg, removeCpf, removeRg, ...fields } = data;

	return {
		...fields,
		...(removeCpf ? { cpf: null } : cpf ? { cpf } : {}),
		...(removeRg ? { rg: null } : rg ? { rg } : {}),
	};
};

import { z } from 'zod';

import { isCivilDate } from '#lib/utils/date.js';

export const AmigoFraternoPdfRequestSchema = z
	.object({ nextDrawDate: z.string().refine(isCivilDate, 'Informe uma data de sorteio válida.') })
	.strict();

export type AmigoFraternoPdfRequest = z.infer<typeof AmigoFraternoPdfRequestSchema>;

export const parseAmigoFraternoPdfRequest = (searchParams: URLSearchParams) => {
	const entries = [...searchParams.entries()];
	const keys = entries.map(([key]) => key);
	if (keys.length !== 1 || keys[0] !== 'nextDrawDate') return AmigoFraternoPdfRequestSchema.safeParse({});
	return AmigoFraternoPdfRequestSchema.safeParse(Object.fromEntries(entries));
};

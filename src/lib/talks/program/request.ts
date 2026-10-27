import { resolve } from '$app/paths';
import { z } from 'zod';

import type { ProgramMonth } from '#lib/talks/program/months.js';
import type { ProgramPendency } from '#lib/talks/program/readiness.js';

export type TalkProgramResult = { ok: true; pdf: Blob } | { ok: false; message: string; pendencias: ProgramPendency[] };

const PROGRAM_FAILURE_MESSAGE = 'Não foi possível gerar a programação. Tente novamente.';

const programFailureSchema = z.object({
	message: z.string().min(1),
	pendencias: z.array(z.object({ id: z.number(), quando: z.string(), falta: z.string() })).default([]),
});

const genericFailure = (): TalkProgramResult => ({ ok: false, message: PROGRAM_FAILURE_MESSAGE, pendencias: [] });

const buildProgramUrl = (month: ProgramMonth) =>
	`${resolve('/(protected)/comunicacao/palestras/programacao')}?mes=${month.key}`;

const readFailure = async (response: Response): Promise<TalkProgramResult> => {
	const body: unknown = await response.json().catch(() => null);
	const parsed = programFailureSchema.safeParse(body);
	return parsed.success ? { ok: false, ...parsed.data } : genericFailure();
};

const translateResponse = async (response: Response): Promise<TalkProgramResult> =>
	response.ok ? { ok: true, pdf: await response.blob() } : readFailure(response);

export const requestTalkProgram = async (
	fetcher: typeof fetch,
	month: ProgramMonth,
	signal: AbortSignal,
): Promise<TalkProgramResult> => {
	try {
		return await translateResponse(await fetcher(buildProgramUrl(month), { signal }));
	} catch (cause) {
		if (!signal.aborted)
			console.error('comunicacao.palestras.programacao_falhou', { mes: month.key, error: cause });
		return genericFailure();
	}
};

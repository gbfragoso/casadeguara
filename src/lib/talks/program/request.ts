import { resolve } from '$app/paths';
import { z } from 'zod';

import { type PdfFailureContract, type PdfResult, requestPdf } from '#lib/pdf/request.js';
import type { ProgramMonth } from '#lib/talks/program/months.js';
import type { ProgramPendency } from '#lib/talks/program/readiness.js';

export type TalkProgramFailure = { message: string; pendencias: ProgramPendency[] };
export type TalkProgramResult = PdfResult<TalkProgramFailure>;

const PROGRAM_FAILURE_MESSAGE = 'Não foi possível gerar a programação. Tente novamente.';

const programFailureSchema = z.object({
	message: z.string().min(1),
	pendencias: z.array(z.object({ id: z.number(), quando: z.string(), falta: z.string() })).default([]),
});

const buildProgramUrl = (month: ProgramMonth) =>
	`${resolve('/(protected)/comunicacao/palestras/programacao')}?mes=${month.key}`;

const buildProgramContract = (month: ProgramMonth): PdfFailureContract<TalkProgramFailure> => ({
	schema: programFailureSchema,
	fallback: { message: PROGRAM_FAILURE_MESSAGE, pendencias: [] },
	logEvent: 'comunicacao.palestras.programacao_falhou',
	logContext: { mes: month.key },
});

export const requestTalkProgram = (
	fetcher: typeof fetch,
	month: ProgramMonth,
	signal: AbortSignal,
): Promise<TalkProgramResult> => requestPdf(fetcher, buildProgramUrl(month), signal, buildProgramContract(month));

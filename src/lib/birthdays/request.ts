import { resolve } from '$app/paths';
import { z } from 'zod';

import { type PdfFailureContract, type PdfResult, requestPdf } from '#lib/pdf/request.js';
import type { CalendarMonth } from '#lib/utils/calendar-month.js';

export type BirthdayPdfFailure = { message: string };

const MONTH_VALUE_DIGITS = 2;

const birthdayFailureSchema = z.object({ message: z.string().min(1) });

const buildBirthdayPdfUrl = ({ month }: CalendarMonth) =>
	`${resolve('/(protected)/secretaria/aniversariantes/pdf')}?mes=${String(month).padStart(MONTH_VALUE_DIGITS, '0')}`;

const buildBirthdayContract = (month: CalendarMonth): PdfFailureContract<BirthdayPdfFailure> => ({
	schema: birthdayFailureSchema,
	fallback: { message: 'Não foi possível gerar o PDF. Tente novamente.' },
	logEvent: 'secretaria.aniversariantes.pdf_falhou',
	logContext: { mes: month.key },
});

export const requestBirthdayPdf = (
	fetcher: typeof fetch,
	month: CalendarMonth,
	signal: AbortSignal,
): Promise<PdfResult<BirthdayPdfFailure>> =>
	requestPdf(fetcher, buildBirthdayPdfUrl(month), signal, buildBirthdayContract(month));

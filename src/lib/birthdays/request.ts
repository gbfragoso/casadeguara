import { resolve } from '$app/paths';

import {
	type PdfFailureContract,
	type PdfMessageFailure,
	type PdfResult,
	pdfMessageFailureSchema,
	requestPdf,
} from '#lib/pdf/request.js';
import type { CalendarMonth } from '#lib/utils/calendar-month.js';

export type BirthdayPdfFailure = PdfMessageFailure;

const MONTH_VALUE_DIGITS = 2;

const buildBirthdayPdfUrl = ({ month }: CalendarMonth) =>
	`${resolve('/(protected)/secretaria/aniversariantes/pdf')}?mes=${String(month).padStart(MONTH_VALUE_DIGITS, '0')}`;

const buildBirthdayContract = (month: CalendarMonth): PdfFailureContract<BirthdayPdfFailure> => ({
	schema: pdfMessageFailureSchema,
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

import { resolve } from '$app/paths';

import type { AttendancePeriod } from '#lib/attendance/dates.js';
import {
	type PdfFailureContract,
	type PdfMessageFailure,
	type PdfResult,
	pdfMessageFailureSchema,
	requestPdf,
} from '#lib/pdf/request.js';

export type AttendancePdfRequest = { params: URLSearchParams; period: AttendancePeriod };

const buildAttendanceContract = ({ start, end }: AttendancePeriod): PdfFailureContract<PdfMessageFailure> => ({
	schema: pdfMessageFailureSchema,
	fallback: { message: 'Não foi possível gerar o PDF. Tente novamente.' },
	logEvent: 'secretaria.frequencia.pdf_falhou',
	logContext: { inicio: start, fim: end },
});

export const requestAttendancePdf = (
	fetcher: typeof fetch,
	{ params, period }: AttendancePdfRequest,
	signal: AbortSignal,
): Promise<PdfResult<PdfMessageFailure>> =>
	requestPdf(
		fetcher,
		`${resolve('/(protected)/secretaria/frequencia/pdf')}?${params}`,
		signal,
		buildAttendanceContract(period),
	);

import { z } from 'zod';

import {
	ATTENDANCE_WEEKDAYS,
	countAttendanceDates,
	listAttendanceDates,
	MAX_ATTENDANCE_DATES,
	type AttendancePeriod,
} from '#lib/attendance/dates.js';
import { isCivilDate } from '#lib/utils/date.js';

export type AttendanceField = 'titulo' | 'periodo' | 'dias';

export type AttendanceListIssue = { field: AttendanceField; message: string };

export type AttendanceListRequest = { title: string; period: AttendancePeriod; dates: string[] };

type FieldResult<Value> = { success: true; data: Value } | { success: false; issue: AttendanceListIssue };

const MAX_TITLE_LENGTH = 60;
const TITLE_MESSAGE = `Informe o título da lista (até ${MAX_TITLE_LENGTH} caracteres).`;
const PERIOD_MESSAGE = 'Informe um período válido.';
const NO_DATES_MESSAGE = 'Nenhuma data do período corresponde aos dias selecionados.';
const CONTROL_CHARACTER_PATTERN = /\p{Cc}/u;

const describeDateLimit = (count: number) =>
	`O período gera ${count} datas; o limite é ${MAX_ATTENDANCE_DATES} por lista. Reduza o período ou os dias da semana.`;

const isPrintableTitle = (title: string) =>
	title.length > 0 && [...title].length <= MAX_TITLE_LENGTH && !CONTROL_CHARACTER_PATTERN.test(title);

const titleSchema = z.string({ error: TITLE_MESSAGE }).trim().refine(isPrintableTitle, TITLE_MESSAGE);

const civilDateSchema = z.string({ error: PERIOD_MESSAGE }).refine(isCivilDate, PERIOD_MESSAGE);

const periodSchema = z
	.object({ start: civilDateSchema, end: civilDateSchema })
	.refine(({ start, end }) => end >= start, PERIOD_MESSAGE);

const weekdaysSchema = z
	.array(z.enum(['0', '1', '2', '3', '4', '5', '6']).transform(Number).pipe(z.literal(ATTENDANCE_WEEKDAYS)))
	.min(1);

const reject = (field: AttendanceField, message: string): FieldResult<never> => ({
	success: false,
	issue: { field, message },
});

const toFieldResult = <Value>(field: AttendanceField, result: z.ZodSafeParseResult<Value>): FieldResult<Value> =>
	result.success ? result : reject(field, result.error.issues[0].message);

const readDates = (period: AttendancePeriod, weekdayValues: string[]): FieldResult<string[]> => {
	const weekdays = weekdaysSchema.safeParse(weekdayValues);
	if (!weekdays.success) return reject('dias', NO_DATES_MESSAGE);
	const count = countAttendanceDates(period, weekdays.data);
	if (count === 0) return reject('dias', NO_DATES_MESSAGE);
	if (count > MAX_ATTENDANCE_DATES) return reject('dias', describeDateLimit(count));
	return { success: true, data: listAttendanceDates(period, weekdays.data) };
};

const collectIssues = (results: (FieldResult<unknown> | undefined)[]) =>
	results.flatMap((result) => (result && !result.success ? [result.issue] : []));

export const parseAttendanceListRequest = (
	params: URLSearchParams,
): { success: true; data: AttendanceListRequest } | { success: false; issues: AttendanceListIssue[] } => {
	const title = toFieldResult('titulo', titleSchema.safeParse(params.get('titulo')));
	const period = toFieldResult(
		'periodo',
		periodSchema.safeParse({ start: params.get('dataInicio'), end: params.get('dataFim') }),
	);
	const dates = period.success ? readDates(period.data, params.getAll('dias')) : undefined;
	if (!title.success || !period.success || !dates?.success) {
		return { success: false, issues: collectIssues([title, period, dates]) };
	}
	return { success: true, data: { title: title.data, period: period.data, dates: dates.data } };
};

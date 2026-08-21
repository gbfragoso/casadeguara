import { z } from 'zod';

const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const daysInMonth = (year: number, month: number) => {
	const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	return [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
};

const isCalendarDate = (value: string) => {
	if (!calendarDatePattern.test(value)) return false;
	const [year, month, day] = value.split('-').map(Number);
	return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
};

export const AmigoFraternoPdfRequestSchema = z
	.object({ nextDrawDate: z.string().refine(isCalendarDate, 'Informe uma data de sorteio válida.') })
	.strict();

export type AmigoFraternoPdfRequest = z.infer<typeof AmigoFraternoPdfRequestSchema>;

export const parseAmigoFraternoPdfRequest = (searchParams: URLSearchParams) => {
	const entries = [...searchParams.entries()];
	const keys = entries.map(([key]) => key);
	if (keys.length !== 1 || keys[0] !== 'nextDrawDate') return AmigoFraternoPdfRequestSchema.safeParse({});
	return AmigoFraternoPdfRequestSchema.safeParse(Object.fromEntries(entries));
};

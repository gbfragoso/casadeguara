import type { BirthdaySource } from '#lib/server/models/cadastro-birthdays.js';
import type { CalendarMonth } from '#lib/utils/calendar-month.js';
import { formatWeekdayAbbreviation } from '#lib/utils/date.js';

export type BirthdayListDocument = { month: CalendarMonth; generatedOn: string; people: BirthdaySource[] };

export type BirthdayGroupContent = { dia: string; diaSemana: string | null; nomes: string[] };

export type BirthdayTextRole = 'dia' | 'diaSemana' | 'nome' | 'aviso';

const DATE_PART_DIGITS = 2;
const IN_MEMORIAM_SUFFIX = ' (in memoriam)';

const toTwoDigits = (value: number) => String(value).padStart(DATE_PART_DIGITS, '0');

const existsInYear = (year: number, month: number, day: number) =>
	new Date(Date.UTC(year, month - 1, day)).getUTCDate() === day;

const formatReferenceWeekday = ({ year, month }: CalendarMonth, day: number) =>
	existsInYear(year, month, day)
		? formatWeekdayAbbreviation(`${year}-${toTwoDigits(month)}-${toTwoDigits(day)}`)
		: null;

const formatPersonName = ({ nome, desencarnado }: BirthdaySource) => {
	const name = nome.trim().normalize('NFC').toLocaleUpperCase('pt-BR');
	return desencarnado ? `${name}${IN_MEMORIAM_SUFFIX}` : name;
};

const groupNamesByDay = (people: BirthdaySource[]) =>
	people.reduce((groups, person) => {
		groups.set(person.dia, [...(groups.get(person.dia) ?? []), formatPersonName(person)]);
		return groups;
	}, new Map<number, string[]>());

export const groupBirthdays = ({ month, people }: BirthdayListDocument): BirthdayGroupContent[] =>
	[...groupNamesByDay(people)]
		.sort(([firstDay], [secondDay]) => firstDay - secondDay)
		.map(([day, nomes]) => ({ dia: toTwoDigits(day), diaSemana: formatReferenceWeekday(month, day), nomes }));

import { formatCalendarMonth, type CalendarMonth } from '#lib/utils/calendar-month.js';

import type { BirthdayMonthOption } from './months';

const DAY_DIGITS = 2;

export const CORRECTION_NOTICE =
	'ATENÇÃO: Quaisquer omissões de nomes ou alterações de data favor avisar ao Ir. Carlson (Tel (73) 98808-2447/Whatsapp) para as correções devidas';

const readMonthName = (option: BirthdayMonthOption) => option.label.toLocaleLowerCase('pt-BR');

export const buildBirthdayFileName = ({ key }: CalendarMonth): string => `aniversariantes-${key}.pdf`;

export const describeEmptyBirthdays = (option: BirthdayMonthOption): string =>
	`Nenhum aniversariante encontrado em ${readMonthName(option)}.`;

export const describeReadyBirthdays = (month: CalendarMonth): string =>
	`Lista de aniversariantes de ${formatCalendarMonth(month)} pronta para impressão.`;

export const formatBirthdayListTitle = (option: BirthdayMonthOption, year: number): string =>
	`Aniversariantes do mês ${readMonthName(option)} / ${year}`;

export const formatBirthdayDate = (dia: number, option: BirthdayMonthOption): string =>
	`${String(dia).padStart(DAY_DIGITS, '0')}/${option.value}`;

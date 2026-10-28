import type { Page } from '@playwright/test';

import { describeReadyBirthdays } from '../../src/lib/birthdays/format';
import {
	BIRTHDAY_MONTH_OPTIONS,
	readCurrentMonthValue,
	resolveReferenceMonth,
	type BirthdayMonthOption,
} from '../../src/lib/birthdays/months';
import type { CalendarMonth } from '../../src/lib/utils/calendar-month';
import { readBahiaIsoDate } from '../../src/lib/utils/date';
import type { E2EData, Participant } from './fixtures-types';
import { openModulePage } from './support/module-shell';

const BIRTHDAYS_PATH = '/secretaria/aniversariantes';
const BIRTH_YEAR = 1990;
const DAYS_IN_EVERY_MONTH = 28;
const DATE_PART_DIGITS = 2;

export const readMonthOption = (month: number): BirthdayMonthOption => {
	const option = BIRTHDAY_MONTH_OPTIONS.find((candidate) => candidate.month === month);
	if (!option) throw new Error(`Mês ${month} não existe.`);
	return option;
};

export const readCurrentMonthOption = () =>
	readMonthOption(Number(readCurrentMonthValue(readBahiaIsoDate(new Date()))));

export const readFollowingMonthOption = (option: BirthdayMonthOption) =>
	readMonthOption((option.month % BIRTHDAY_MONTH_OPTIONS.length) + 1);

export const readReferenceMonth = (option: BirthdayMonthOption): CalendarMonth =>
	resolveReferenceMonth(option.month, readBahiaIsoDate(new Date()));

export const monthSelect = (page: Page) => page.getByRole('combobox', { name: 'Mês' });

export const generateListButton = (page: Page) => page.getByRole('button', { name: 'Gerar lista' });

export const generatePdfButton = (page: Page) => page.getByRole('button', { name: 'Gerar PDF' });

export const openPdfLink = (page: Page) => page.getByRole('link', { name: 'Abrir para imprimir' });

export const downloadPdfLink = (page: Page) => page.getByRole('link', { name: 'Baixar' });

export const pdfStatus = (page: Page) => page.getByRole('status');

export const readyStatus = (page: Page, month: CalendarMonth) =>
	pdfStatus(page).filter({ hasText: describeReadyBirthdays(month) });

export const openBirthdaysPage = (page: Page, e2e: E2EData) => openModulePage(page, e2e, BIRTHDAYS_PATH);

export const chooseMonth = (page: Page, option: BirthdayMonthOption) =>
	monthSelect(page).selectOption({ label: option.label });

const formatBirthday = (option: BirthdayMonthOption, index: number) =>
	[BIRTH_YEAR, option.month, (index % DAYS_IN_EVERY_MONTH) + 1]
		.map((part) => String(part).padStart(DATE_PART_DIGITS, '0'))
		.join('-');

export const seedBirthdayWorkers = async (
	e2e: E2EData,
	option: BirthdayMonthOption,
	count: number,
): Promise<Participant[]> => {
	const workers = await Promise.all(
		Array.from({ length: count }, (_, index) => e2e.createParticipant(`aniversario-${index + 1}`)),
	);
	await Promise.all(
		workers.map(
			(worker, index) =>
				e2e.database`update cadastros set aniversario = ${formatBirthday(option, index)} where idleitor = ${worker.id}`,
		),
	);
	return workers;
};

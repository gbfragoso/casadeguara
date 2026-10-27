import { expect, type Page } from '@playwright/test';

import { describeReadyProgram } from '../../src/lib/talks/program/format';
import { formatProgramMonthOption, listProgramMonths, type ProgramMonth } from '../../src/lib/talks/program/months';
import { readBahiaIsoDate } from '../../src/lib/utils/date';
import type { E2EData } from './fixtures';

const PROGRAM_TIME = '19:30';
const DAY_DIGITS = 2;

export const readProgramMonths = () => listProgramMonths(readBahiaIsoDate(new Date()));

export const programAction = (page: Page) => page.getByRole('button', { name: 'Programação do mês' });

export const programDialog = (page: Page) => page.getByRole('dialog', { name: 'Programação do mês' });

export const monthOption = (page: Page, month: ProgramMonth) =>
	programDialog(page).getByRole('button', { name: formatProgramMonthOption(month), exact: true });

export const readyStatus = (page: Page, month: ProgramMonth) =>
	programDialog(page)
		.getByRole('status')
		.filter({ hasText: describeReadyProgram(month) });

export const expectOfferedMonths = async (page: Page, months: readonly ProgramMonth[]) => {
	const options = programDialog(page).getByRole('group', { name: 'Mês da programação' }).getByRole('button');
	await expect(options).toHaveText(months.map(formatProgramMonthOption));
};

export const seedCompleteMonth = async (e2e: E2EData, month: ProgramMonth, count: number) => {
	const seeds = Array.from({ length: count }, (_, index) => ({
		titulo: `${e2e.token} programação ${index + 1}`,
		data: `${month.key}-${String(index + 1).padStart(DAY_DIGITS, '0')}`,
		horario: PROGRAM_TIME,
	}));
	const talks = await e2e.createTalks(seeds);
	const speakerId = await e2e.createSpeaker({ nome: `Palestrante programação ${e2e.token}` });
	await Promise.all(talks.map((talk) => e2e.assignSpeaker(talk.id, speakerId)));
};

import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import { formatWeekdayAbbreviation } from '#lib/talks/program/format.js';
import type { ProgramMonth } from '#lib/talks/program/months.js';
import type { ReadyProgramTalk } from '#lib/talks/program/readiness.js';
import { formatTalkTime } from '#lib/talks/schedule.js';

export type ProgramTalkSource = {
	id: number;
	data: string;
	horario: string;
	titulo: string | null;
	observacoes: string | null;
	local: string | null;
	palestrante: { nome: string } | null;
};

export type TalkProgramDocument = {
	month: ProgramMonth;
	generatedOn: string;
	talks: ReadyProgramTalk<ProgramTalkSource>[];
};

export type ProgramEntryContent = {
	dia: string;
	diaSemana: string;
	horario: string;
	titulo: string;
	observacao: string | null;
	palestrante: string;
	local: string | null;
};

const normalize = (text: string) => text.trim().normalize('NFC');

const readOptionalText = (text: string | null) => (text?.trim() ? normalize(text) : null);

const isDefaultLocation = (local: string) =>
	local.localeCompare(DEFAULT_TALK_LOCATION, 'pt-BR', { sensitivity: 'base' }) === 0;

const formatLocation = (local: string | null) => {
	const text = readOptionalText(local);
	if (!text || isDefaultLocation(text)) return null;
	return `Local: ${text}`;
};

const readDayOfMonth = (data: string) => data.split('-')[2];

export const toProgramEntryContent = (talk: ReadyProgramTalk<ProgramTalkSource>): ProgramEntryContent => ({
	dia: readDayOfMonth(talk.data),
	diaSemana: formatWeekdayAbbreviation(talk.data),
	horario: formatTalkTime(talk.horario),
	titulo: normalize(talk.titulo),
	observacao: readOptionalText(talk.observacoes),
	palestrante: `Palestrante: ${normalize(talk.palestrante.nome)}`,
	local: formatLocation(talk.local),
});

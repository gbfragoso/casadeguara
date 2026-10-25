import type { IsoWeekday } from '#lib/utils/date.js';

export type WeekdayTimes = Record<IsoWeekday, string | null>;

export type SpeakerOption = { id: number; nome: string };

export type TalkSpeaker = SpeakerOption & { temFoto: boolean };

export type TalkCard = {
	id: number;
	data: string;
	horario: string;
	titulo: string | null;
	observacoes: string | null;
	local: string | null;
	palestrante: TalkSpeaker | null;
	versao: number;
};

import { formatArtDateSeal, formatArtSchedule } from '#lib/talks/art/format.js';
import type { ReadyTalk } from '#lib/talks/art/readiness.js';

export type TalkArtSource = {
	id: number;
	versao: number;
	data: string;
	horario: string;
	titulo: string | null;
	observacoes: string | null;
	local: string | null;
	reuniaoCom: string[];
	palestrante: { nome: string; foto: Uint8Array | null } | null;
};

export type TalkArtContent = {
	dia: string;
	mes: string;
	destaque: string;
	titulo: string;
	referencia: string | null;
	palestrante: string;
	atividades: string[];
	local: string | null;
	foto: Uint8Array | null;
};

const normalize = (text: string) => text.normalize('NFC');

const toUpperCase = (text: string) => normalize(text).toLocaleUpperCase('pt-BR');

const readOptionalText = (text: string | null) => (text?.trim() ? normalize(text) : null);

export const toTalkArtContent = (talk: ReadyTalk<TalkArtSource>): TalkArtContent => {
	const local = readOptionalText(talk.local);
	return {
		...formatArtDateSeal(talk.data),
		destaque: formatArtSchedule(talk.data, talk.horario),
		titulo: toUpperCase(talk.titulo),
		referencia: readOptionalText(talk.observacoes),
		palestrante: toUpperCase(talk.palestrante.nome),
		atividades: talk.reuniaoCom.map(normalize),
		local: local && toUpperCase(local),
		foto: talk.palestrante.foto,
	};
};

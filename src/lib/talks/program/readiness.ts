import { formatTalkSchedule } from '#lib/talks/schedule.js';

export type ProgramTalkFacts = {
	id: number;
	data: string;
	horario: string;
	titulo: string | null;
	palestrante: { nome: string } | null;
};

export type ReadyProgramTalk<T extends ProgramTalkFacts> = T & {
	titulo: string;
	palestrante: NonNullable<T['palestrante']>;
};

export type ProgramPendency = { id: number; quando: string; falta: string };

export type ProgramReadiness<T extends ProgramTalkFacts> =
	| { status: 'pronta'; talks: ReadyProgramTalk<T>[] }
	| { status: 'vazia' }
	| { status: 'pendente'; pendencias: ProgramPendency[] };

const hasRequiredData = <T extends ProgramTalkFacts>(talk: T): talk is ReadyProgramTalk<T> =>
	Boolean(talk.titulo) && talk.palestrante !== null;

const describeMissingData = ({ titulo, palestrante }: ProgramTalkFacts): string => {
	if (!titulo && !palestrante) return 'Faltam o título e o palestrante.';
	return titulo ? 'Falta o palestrante.' : 'Falta o título.';
};

const toPendency = (talk: ProgramTalkFacts): ProgramPendency => ({
	id: talk.id,
	quando: formatTalkSchedule(talk.data, talk.horario),
	falta: describeMissingData(talk),
});

export const checkProgramReadiness = <T extends ProgramTalkFacts>(talks: readonly T[]): ProgramReadiness<T> => {
	if (talks.length === 0) return { status: 'vazia' };
	const pendencias = talks.filter((talk) => !hasRequiredData(talk)).map(toPendency);
	if (pendencias.length > 0) return { status: 'pendente', pendencias };
	return { status: 'pronta', talks: talks.filter(hasRequiredData) };
};

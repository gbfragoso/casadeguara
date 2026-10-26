import { formatCivilDate, formatMonthName, formatWeekday } from '#lib/utils/date.js';

import type { ReadyTalk, TalkArtFacts } from './readiness';

type DescribedTalk = ReadyTalk<TalkArtFacts> & { data: string; horario: string };

const readClock = (horario: string) => {
	const [hours, minutes] = horario.split(':');
	return { hours, minutes };
};

export const formatArtTime = (horario: string): string => {
	const { hours, minutes } = readClock(horario);
	return `${hours}h${minutes}`;
};

export const formatArtSchedule = (data: string, horario: string): string =>
	`${formatWeekday(data)}, às ${formatArtTime(horario)}`;

export const formatArtDateSeal = (data: string): { dia: string; mes: string } => ({
	dia: data.split('-')[2],
	mes: formatMonthName(data).toLocaleUpperCase('pt-BR'),
});

export const buildTalkArtFileName = (data: string, horario: string): string => {
	const { hours, minutes } = readClock(horario);
	return `palestra-${data}-${hours}${minutes}.png`;
};

export const describeTalkArt = ({ titulo, data, horario, palestrante }: DescribedTalk): string =>
	`Arte de divulgação da palestra “${titulo}”, em ${formatCivilDate(data)}, às ${formatArtTime(horario)}, ` +
	`com ${palestrante.nome}.`;

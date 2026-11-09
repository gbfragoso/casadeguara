import type { PalestraModel } from '#lib/server/models/palestra.js';
import { isUpcomingPublicTalk, readUpcomingTalkCutoff } from '#lib/server/models/palestra-public.js';
import { readMonthRange, readProgramMonth } from '#lib/talks/program/months.js';
import type { MonthTalk, PublicTalkCard } from '#lib/talks/types.js';
import { formatCalendarMonth } from '#lib/utils/calendar-month.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

type TalksPageDependencies = { talks: Pick<PalestraModel, 'listMonthPublic'>; clock: () => Date };

const NO_TALKS: readonly MonthTalk[] = [];

const markHeldTalks = (talks: PublicTalkCard[], reference: Date): MonthTalk[] => {
	const cutoff = readUpcomingTalkCutoff(reference);
	return talks.map((talk) => ({ ...talk, realizada: !isUpcomingPublicTalk(talk, cutoff) }));
};

export const createTalksPageLoad =
	({ talks, clock }: TalksPageDependencies) =>
	async () => {
		const reference = clock();
		const hoje = readBahiaIsoDate(reference);
		const month = readProgramMonth(hoje);
		const mes = formatCalendarMonth(month);
		try {
			const monthTalks = await talks.listMonthPublic(readMonthRange(month));
			return { hoje, mes, palestras: markHeldTalks(monthTalks, reference), programacaoIndisponivel: false };
		} catch (cause) {
			console.error('palestras.mes.falha', { operacao: 'listar_palestras_do_mes', error: cause });
			return { hoje, mes, palestras: NO_TALKS, programacaoIndisponivel: true };
		}
	};

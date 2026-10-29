import type { PalestraModel } from '#lib/server/models/palestra.js';
import { readUpcomingTalkCutoff } from '#lib/server/models/palestra-public.js';
import { readBahiaIsoDate } from '#lib/utils/date.js';

export const HOME_TALK_COUNT = 4;

type HomeDependencies = { talks: Pick<PalestraModel, 'listUpcomingPublic'>; clock: () => Date };

export const createHomeLoad =
	({ talks, clock }: HomeDependencies) =>
	async () => {
		const reference = clock();
		const hoje = readBahiaIsoDate(reference);
		try {
			const cutoff = readUpcomingTalkCutoff(reference);
			const [destaque = null, ...seguintes] = await talks.listUpcomingPublic(cutoff, HOME_TALK_COUNT);
			return { hoje, destaque, seguintes, programacaoIndisponivel: false };
		} catch (cause) {
			console.error('inicio.palestras.falha', { operacao: 'listar_palestras', error: cause });
			return { hoje, destaque: null, seguintes: [], programacaoIndisponivel: true };
		}
	};

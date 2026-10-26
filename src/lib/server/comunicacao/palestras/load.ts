import { hasComunicacaoAdminAccess, requireComunicacaoAccess } from '#lib/server/authorization/comunicacao.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import type { PalestranteModel } from '#lib/server/models/palestrante.js';
import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';

import type { BoardUser } from './access';
import { runTalkOperation } from './failures';

type LoadDependencies = {
	talks: Pick<PalestraModel, 'listAgenda' | 'listHistory' | 'suggestTimes'>;
	speakers: Pick<PalestranteModel, 'listOptions'>;
	today: () => string;
};
type LoadContext = { locals: { user: BoardUser | null }; url: URL };

const HISTORY_VIEW = 'historico';
const FIRST_PAGE = 1;

const readPage = (url: URL) => {
	const page = Number(url.searchParams.get('pagina'));
	return Number.isSafeInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE;
};

const loadTalks = async (talks: LoadDependencies['talks'], url: URL, today: string) => {
	if (url.searchParams.get('visao') !== HISTORY_VIEW) {
		return { visao: 'agenda' as const, palestras: await talks.listAgenda(today) };
	}

	const pagina = readPage(url);
	const { rows, hasNext } = await talks.listHistory(today, pagina);
	return { visao: 'historico' as const, palestras: rows, pagina, temProxima: hasNext };
};

const loadBoard = async ({ talks, speakers }: LoadDependencies, url: URL, hoje: string) => {
	const startedAt = performance.now();
	const [view, horariosSugeridos, palestrantes] = await Promise.all([
		loadTalks(talks, url, hoje),
		talks.suggestTimes(),
		speakers.listOptions(),
	]);
	console.info('comunicacao.palestras.agenda_carregada', {
		quantidade: view.palestras.length,
		duracaoMs: performance.now() - startedAt,
	});
	return { ...view, horariosSugeridos, palestrantes };
};

export const createTalkBoardLoad =
	(dependencies: LoadDependencies) =>
	async ({ locals, url }: LoadContext) => {
		const user = requireComunicacaoAccess(locals.user);

		const hoje = dependencies.today();
		const board = await runTalkOperation('carregar', () => loadBoard(dependencies, url, hoje));

		return { ...board, hoje, localPadrao: DEFAULT_TALK_LOCATION, isAdmin: hasComunicacaoAdminAccess(user) };
	};

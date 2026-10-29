import { render } from 'svelte/server';

import type { PublicTalkCard } from '#lib/talks/types.js';
import Page from '../../../src/routes/+page.svelte';
import { parseRenderedBody } from '../support/rendered-document';

export const TODAY = '2026-10-28';

export const buildTalk = (overrides: Partial<PublicTalkCard> = {}): PublicTalkCard => ({
	id: 1,
	data: TODAY,
	horario: '19:30',
	titulo: 'A prece',
	observacoes: null,
	local: null,
	reuniaoCom: [],
	palestrante: { nome: 'Carmélia Amorim', temFoto: false },
	...overrides,
});

type HomeData = { destaque: PublicTalkCard | null; seguintes: PublicTalkCard[] };

export const renderHome = ({ destaque, seguintes }: HomeData) =>
	parseRenderedBody(
		render(Page, {
			props: { data: { hoje: TODAY, destaque, seguintes, programacaoIndisponivel: destaque === null } },
		}).body,
	);

export const readText = (document: ReturnType<typeof renderHome>, selector: string) =>
	document.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

export const readLinks = (document: ReturnType<typeof renderHome>, scope: string) =>
	[...document.querySelectorAll(`${scope} a`)].map((link) => [
		link.textContent?.replace(/\s+/g, ' ').trim(),
		link.getAttribute('href'),
	]);

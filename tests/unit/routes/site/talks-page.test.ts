import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { DEFAULT_TALK_LOCATION } from '#lib/talks/defaults.js';
import type { MonthTalk, PublicTalkCard } from '#lib/talks/types.js';
import { parseRenderedBody } from '../../support/rendered-document';
import Page from '../../../../src/routes/(site)/palestras/+page.svelte';
import { SPEAKER_WITH_PHOTO, buildTalk } from './home-page-support';

type TalksData = { palestras?: MonthTalk[]; programacaoIndisponivel?: boolean };

const renderTalks = ({ palestras = [], programacaoIndisponivel = false }: TalksData) =>
	parseRenderedBody(
		render(Page, {
			props: { data: { hoje: '2026-11-10', mes: 'novembro de 2026', palestras, programacaoIndisponivel } },
		}).body,
	);

const held = (talk: PublicTalkCard): MonthTalk => ({ ...talk, realizada: true });
const upcoming = (talk: PublicTalkCard): MonthTalk => ({ ...talk, realizada: false });

const readTexts = (document: ReturnType<typeof renderTalks>, selector: string) =>
	[...document.querySelectorAll(selector)].map((element) => element.textContent?.replace(/\s+/g, ' ').trim());

const MONTH_ITEMS = '[aria-label="Palestras do mês"] li';

const readSchedules = (document: ReturnType<typeof renderTalks>) =>
	[...document.querySelectorAll(`${MONTH_ITEMS} h2`)].map((heading) =>
		heading.previousElementSibling?.textContent?.replace(/\s+/g, ' ').trim(),
	);

describe('talks page', () => {
	it('names the current month in its title', () => {
		const document = renderTalks({});

		expect(readTexts(document, 'h1')).toEqual(['Palestras de novembro de 2026']);
	});

	it('lists held and upcoming talks of the month in one list in order', () => {
		const palestras = [
			held(buildTalk({ id: 1, data: '2026-11-03', titulo: 'A caridade' })),
			upcoming(buildTalk({ id: 2, data: '2026-11-12', titulo: 'A fé' })),
			upcoming(buildTalk({ id: 3, data: '2026-11-19', titulo: 'A esperança' })),
		];

		const document = renderTalks({ palestras });

		expect(readTexts(document, `${MONTH_ITEMS} h2`)).toEqual(['A caridade', 'A fé', 'A esperança']);
	});

	it('tags only the talks already held', () => {
		const palestras = [
			held(buildTalk({ id: 1, data: '2026-11-03', titulo: 'A caridade' })),
			upcoming(buildTalk({ id: 2, data: '2026-11-17', titulo: 'A fé' })),
		];

		const document = renderTalks({ palestras });

		expect(readTexts(document, MONTH_ITEMS)).toEqual([
			'03 TER Realizada 19h30 A caridade Carmélia Amorim',
			'17 TER 19h30 A fé Carmélia Amorim',
		]);
	});

	it('says when an upcoming talk is today or tomorrow', () => {
		const palestras = [
			upcoming(buildTalk({ id: 1, data: '2026-11-10', horario: '19:30' })),
			upcoming(buildTalk({ id: 2, data: '2026-11-11', horario: '15:00' })),
			upcoming(buildTalk({ id: 3, data: '2026-11-12', horario: '19:30' })),
		];

		const document = renderTalks({ palestras });

		expect(readSchedules(document)).toEqual(['Hoje às 19h30', 'Amanhã às 15h00', '19h30']);
	});

	it('keeps only the time on a talk held earlier today', () => {
		const palestras = [held(buildTalk({ id: 1, data: '2026-11-10', horario: '08:45' }))];

		const document = renderTalks({ palestras });

		expect(readSchedules(document)).toEqual(['Realizada 08h45']);
	});

	it('shows the notes and a location other than the headquarters', () => {
		const palestras = [
			upcoming(buildTalk({ id: 1, observacoes: 'Transmitida pelo YouTube', local: 'Praça do Guará' })),
		];

		const document = renderTalks({ palestras });

		expect(readTexts(document, `${MONTH_ITEMS} > div > p:not(:first-child)`)).toEqual([
			'Transmitida pelo YouTube',
			'Local: Praça do Guará',
		]);
	});

	it('omits the location when the talk is at the headquarters', () => {
		const palestras = [upcoming(buildTalk({ id: 1, local: DEFAULT_TALK_LOCATION }))];

		const document = renderTalks({ palestras });

		expect(document.body.textContent).not.toContain('Local:');
	});

	it('shows the speaker photo on upcoming and held talks', () => {
		const palestras = [
			held(buildTalk({ id: 1, data: '2026-11-03', palestrante: SPEAKER_WITH_PHOTO })),
			upcoming(buildTalk({ id: 2, data: '2026-11-17', palestrante: SPEAKER_WITH_PHOTO })),
		];

		const document = renderTalks({ palestras });

		const photos = [...document.querySelectorAll('img')].map((image) => image.getAttribute('src'));
		expect(photos).toEqual(['/palestras/1/foto', '/palestras/2/foto']);
	});

	it('announces the program of an empty month with the Instagram link', () => {
		const document = renderTalks({});

		expect(document.body.textContent).toContain('A programação de novembro de 2026 será divulgada em breve.');
		expect(document.querySelector('a[rel="external"]')?.textContent).toBe('Instagram');
	});

	it('tells when the program cannot be loaded', () => {
		const document = renderTalks({ programacaoIndisponivel: true });

		expect(document.body.textContent).toContain('Não conseguimos carregar a programação agora.');
		expect(document.querySelector('ul')).toBeNull();
	});
});

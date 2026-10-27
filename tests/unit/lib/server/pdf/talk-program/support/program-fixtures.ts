import type { ProgramTalkSource, TalkProgramDocument } from '#lib/server/pdf/talk-program/content.js';
import type { ReadyProgramTalk } from '#lib/talks/program/readiness.js';

type ReadyTalk = ReadyProgramTalk<ProgramTalkSource>;

const exactly = (text: string, length: number) => {
	if (text.length !== length) throw new Error(`Fixture "${text}" has ${text.length} characters, expected ${length}.`);
	return text;
};

const repeatWideWords = (length: number, wordLength: number) => {
	const word = 'MW'.repeat(wordLength).slice(0, wordLength);
	return exactly(`${word} `.repeat(length).slice(0, length).trimEnd().padEnd(length, 'W'), length);
};

const repeatPhrase = (phrase: string, length: number) =>
	exactly(phrase.repeat(Math.ceil(length / phrase.length)).slice(0, length), length);

const toTwoDigits = (value: number) => String(value).padStart(2, '0');

export const NOVEMBER_2026 = { key: '2026-11', year: 2026, month: 11 };

export const GENERATED_ON = '2026-10-27';

export const BASE_TALK: ReadyTalk = {
	id: 412,
	data: '2026-11-02',
	horario: '08:45',
	titulo: 'Ninguém pode ver o reino de Deus se não nascer de novo',
	observacoes: '(Cap. IV)',
	local: 'Rua Major Dórea, 86, Castália, Itabuna-BA',
	palestrante: { nome: 'Alcione Soledade' },
};

const TYPICAL_TITLES = [
	'Ninguém pode ver o reino de Deus se não nascer de novo, hoje',
	'Bem-aventurados os mansos, porque eles herdarão toda a Terra',
	'Amai os vossos inimigos e orai pelos que vos perseguem hoje.',
	'A fé que transporta montanhas e a força da confiança em Deus',
	'Fora da caridade não há salvação: o caminho certo para o bem',
	'Honrai a vosso pai e a vossa mãe com gratidão e com ternura.',
	'O Cristo consolador e a esperança para os aflitos deste orbe',
	'Pedi e obtereis: a prece como alimento diário da nossa alma.',
	'Não saiba a vossa mão esquerda o que faz a vossa mão direita',
	'A parábola do semeador e o solo fértil dos corações humildes',
	'Muitos os chamados, poucos os escolhidos na seara do Senhor.',
	'Buscai e achareis: o esforço próprio na reforma interior, já',
].map((title) => exactly(title, 60));

const createMonthTalk = (index: number, talk: Partial<ReadyTalk>): ReadyTalk => ({
	...BASE_TALK,
	id: index + 1,
	data: `2026-11-${toTwoDigits(index + 1)}`,
	...talk,
});

export const TYPICAL_MONTH_TALKS = TYPICAL_TITLES.map((titulo, index) =>
	createMonthTalk(index, { titulo, observacoes: '(O Evangelho Segundo o Espiritismo, Cap. IV)' }),
);

const FULL_MONTH_SIZE = 15;

export const FULL_MONTH_TALKS = Array.from({ length: FULL_MONTH_SIZE }, (_, index) => {
	const number = toTwoDigits(index + 1);
	return createMonthTalk(index, {
		titulo: exactly(`Palestra ${number}: ninguém poderá ver o reino de Deus sem nascer da água, já`, 70),
		observacoes: exactly(
			`Referência ${number}: O Evangelho Segundo o Espiritismo, Cap. IV, itens 1 a 17, e João.`,
			80,
		),
	});
});

const LONG_SPEAKER_NAME = exactly('Maria Aparecida Wanderley Monteiro de Albuquerque Bitencourt', 60);

export const WIDE_WORST_CASE_TALK: ReadyTalk = {
	...BASE_TALK,
	titulo: repeatWideWords(70, 6),
	observacoes: repeatWideWords(80, 7),
	local: repeatWideWords(60, 5),
	palestrante: { nome: repeatWideWords(60, 8) },
};

export const LONG_WORST_CASE_TALK: ReadyTalk = {
	...BASE_TALK,
	titulo: exactly('Ninguém poderá ver o reino de Deus se não nascer da água e do Espírito', 70),
	observacoes: exactly('(O Evangelho Segundo o Espiritismo, Cap. IV, itens 1 a 17, e João 3:1-12; 5:1-8)', 80),
	local: exactly('Lar Fabiano de Cristo, Rua Paulino Vieira, 2100, Itabuna-BA.', 60),
	palestrante: { nome: LONG_SPEAKER_NAME },
};

export const LEGACY_LIMIT_TALK: ReadyTalk = {
	...BASE_TALK,
	titulo: repeatPhrase('Ninguém pode ver o reino de Deus se não nascer de novo. ', 120),
	observacoes: repeatPhrase('O Evangelho Segundo o Espiritismo, Cap. IV, itens 1 a 17. ', 500),
	palestrante: { nome: repeatPhrase('Maria Aparecida Wanderley Monteiro de Albuquerque ', 120) },
	local: LONG_WORST_CASE_TALK.local,
};

export const createProgramDocument = (talks: ReadyTalk[]): TalkProgramDocument => ({
	month: NOVEMBER_2026,
	generatedOn: GENERATED_ON,
	talks,
});

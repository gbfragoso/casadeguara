import { readFileSync } from 'node:fs';

import fontkit from '@pdf-lib/fontkit';

import type { ArtFonts } from '#lib/server/image/text/fonts.js';
import { createArtMeasurers } from '#lib/server/image/text/shaper.js';
import type { TalkArtSource } from '#lib/server/image/talk-art/content.js';
import type { ReadyTalk } from '#lib/talks/art/readiness.js';

const FONT_DIRECTORY = 'src/lib/server/image/text/fonts';

const readTestFont = (name: string) => fontkit.create(new Uint8Array(readFileSync(`${FONT_DIRECTORY}/${name}.ttf`)));

export const loadTestFonts = (): ArtFonts => ({
	regular: readTestFont('Roboto-Regular'),
	medium: readTestFont('Roboto-Medium'),
	bold: readTestFont('Roboto-Bold'),
});

export const testMeasurers = createArtMeasurers(loadTestFonts());

const exactly = (text: string, length: number) => {
	if (text.length !== length) throw new Error(`Fixture "${text}" has ${text.length} characters, expected ${length}.`);
	return text;
};

const repeatWideWords = (length: number, wordLength: number) => {
	const word = 'MW'.repeat(wordLength).slice(0, wordLength);
	return exactly(`${word} `.repeat(length).slice(0, length).trimEnd().padEnd(length, 'W'), length);
};

export const CA04_TALK: ReadyTalk<TalkArtSource> = {
	id: 412,
	versao: 4,
	data: '2026-10-26',
	horario: '08:45',
	titulo: 'Ninguém pode ver o meu reino se não nascer de novo',
	observacoes: '(Cap. IV)',
	local: 'Rua Major Dórea, 86, Castália, Itabuna-BA',
	reuniaoCom: ['Estudo do Evangelho', 'Passes e água fluidificada', 'Atendimento fraterno'],
	palestrante: { nome: 'Alcione Soledade', foto: null },
};

const LONG_SPEAKER_NAME = exactly('Maria Aparecida Wanderley Monteiro de Albuquerque Bitencourt', 60);

export const WIDE_WORST_CASE_TALK: ReadyTalk<TalkArtSource> = {
	...CA04_TALK,
	data: '2026-09-23',
	titulo: repeatWideWords(70, 6),
	observacoes: repeatWideWords(80, 7),
	local: repeatWideWords(60, 5),
	reuniaoCom: Array.from({ length: 5 }, () => repeatWideWords(32, 10).toLowerCase()),
	palestrante: { nome: LONG_SPEAKER_NAME, foto: null },
};

export const TALLEST_WORST_CASE_TALK: ReadyTalk<TalkArtSource> = {
	...CA04_TALK,
	titulo: exactly('Ninguém poderá ver o reino de Deus se não nascer da água e do Espírito', 70),
	observacoes: exactly('(O Evangelho Segundo o Espiritismo, Cap. IV, itens 1 a 17, e João 3:1-12; 5:1-8)', 80),
	local: exactly('Rua Major Dórea, 86, Castália, Itabuna-BA, Salão Principal 2', 60),
	reuniaoCom: [
		'Estudo do Evangelho em comunhão.',
		'Palestra doutrinária da semana 2',
		'Passes e água fluidificada geral',
		'Atendimento fraterno individual.',
		'Atendimento espiritual na sala 2',
	].map((activity) => exactly(activity, 32)),
	palestrante: { nome: LONG_SPEAKER_NAME, foto: null },
};

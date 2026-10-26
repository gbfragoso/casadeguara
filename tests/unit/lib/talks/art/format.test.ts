import { afterEach, describe, expect, it } from 'vitest';

import {
	buildTalkArtFileName,
	describeTalkArt,
	formatArtDateSeal,
	formatArtSchedule,
	formatArtTime,
} from '#lib/talks/art/format.js';

const originalTimeZone = process.env.TZ;

afterEach(() => {
	if (originalTimeZone === undefined) delete process.env.TZ;
	else process.env.TZ = originalTimeZone;
});

describe('TU-10 talk art formatting', () => {
	it('writes the time as HHhMM', () => {
		expect(formatArtTime('08:45')).toBe('08h45');
	});

	it('formats the date seal with the day and the month in capitals', () => {
		expect(formatArtDateSeal('2026-10-26')).toEqual({ dia: '26', mes: 'OUTUBRO' });
	});

	it.each(['UTC', 'Pacific/Auckland', 'America/Bahia'])('keeps the civil day of the seal in %s', (timeZone) => {
		process.env.TZ = timeZone;

		expect(formatArtDateSeal('2026-03-01')).toEqual({ dia: '01', mes: 'MARÇO' });
	});

	it('formats the weekday highlight without the date', () => {
		expect(formatArtSchedule('2026-10-26', '08:45')).toBe('Segunda-feira, às 08h45');
	});

	it('names the art file after the date and the time', () => {
		expect(buildTalkArtFileName('2026-10-26', '08:45')).toBe('palestra-2026-10-26-0845.png');
	});

	it('describes the preview with the title, date, time and speaker', () => {
		const talk = {
			titulo: 'Ninguém pode ver o meu reino se não nascer de novo',
			observacoes: null,
			local: null,
			reuniaoCom: [],
			palestrante: { nome: 'Alcione Soledade' },
			data: '2026-10-26',
			horario: '08:45',
		};

		const description = describeTalkArt(talk);

		expect(description).toBe(
			'Arte de divulgação da palestra “Ninguém pode ver o meu reino se não nascer de novo”, ' +
				'em 26/10/2026, às 08h45, com Alcione Soledade.',
		);
	});
});

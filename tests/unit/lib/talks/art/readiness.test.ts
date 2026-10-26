import { describe, expect, it } from 'vitest';

import { checkTalkArtReadiness, type TalkArtFacts } from '#lib/talks/art/readiness.js';

const SPEAKER = { id: 7, nome: 'Alcione Soledade' };

const buildTalk = (overrides: Partial<TalkArtFacts> = {}): TalkArtFacts => ({
	titulo: 'Ninguém pode ver o meu reino se não nascer de novo',
	observacoes: '(Cap. IV)',
	local: 'Rua Major Dórea, 86, Castália, Itabuna-BA',
	reuniaoCom: ['Estudo do Evangelho', 'Passes e água fluidificada', 'Atendimento fraterno'],
	palestrante: SPEAKER,
	...overrides,
});

describe('TU-07 checkTalkArtReadiness', () => {
	it.each([
		[{ titulo: null, palestrante: null }, 'Para gerar a arte, defina o título e o palestrante.'],
		[{ titulo: null }, 'Para gerar a arte, defina o título da palestra.'],
		[{ palestrante: null }, 'Para gerar a arte, defina o palestrante.'],
	])('names the missing title, speaker or both for %o', (overrides, message) => {
		const talk = buildTalk(overrides);

		const readiness = checkTalkArtReadiness(talk);

		expect(readiness).toEqual({ ready: false, blocker: expect.objectContaining({ mensagem: message }) });
	});

	it('reports the missing data before a text above the limits', () => {
		const talk = buildTalk({ titulo: null, observacoes: 'a'.repeat(120) });

		const readiness = checkTalkArtReadiness(talk);

		expect(readiness).toMatchObject({ ready: false, blocker: { codigo: 'titulo-ausente' } });
	});
});

describe('TU-08 checkTalkArtReadiness', () => {
	it('blocks legacy notes of 120 characters asking to shorten them in the card', () => {
		const talk = buildTalk({ observacoes: 'a'.repeat(120) });

		const readiness = checkTalkArtReadiness(talk);

		expect(readiness).toEqual({
			ready: false,
			blocker: {
				codigo: 'observacoes-longas',
				mensagem: 'As observações estão maiores do que cabe na arte. Encurte-as no card para gerar a arte.',
			},
		});
	});

	it.each([
		[{ titulo: 'M'.repeat(71) }, 'titulo-longo'],
		[{ local: 'L'.repeat(61) }, 'local-longo'],
		[{ reuniaoCom: ['Atividade'].concat(Array(5).fill('Outra')) }, 'reuniao-com-invalida'],
		[{ reuniaoCom: ['A'.repeat(33)] }, 'reuniao-com-invalida'],
	])('blocks legacy texts above the art limits with %o', (overrides, codigo) => {
		const talk = buildTalk(overrides);

		const readiness = checkTalkArtReadiness(talk);

		expect(readiness).toMatchObject({ ready: false, blocker: { codigo } });
	});

	it('checks the title before the notes, the location and the activities', () => {
		const talk = buildTalk({
			titulo: 'M'.repeat(71),
			observacoes: 'a'.repeat(81),
			local: 'L'.repeat(61),
			reuniaoCom: ['A'.repeat(33)],
		});

		const readiness = checkTalkArtReadiness(talk);

		expect(readiness).toMatchObject({ ready: false, blocker: { codigo: 'titulo-longo' } });
	});
});

describe('TU-09 checkTalkArtReadiness', () => {
	it('marks a complete talk within limits as ready', () => {
		const talk = buildTalk({
			titulo: 'M'.repeat(70),
			observacoes: 'a'.repeat(80),
			local: 'L'.repeat(60),
			reuniaoCom: Array(5).fill('A'.repeat(32)),
		});

		const readiness = checkTalkArtReadiness(talk);

		expect(readiness).toEqual({ ready: true, talk });
	});

	it('keeps a ready talk without optional texts', () => {
		const talk = buildTalk({ observacoes: null, local: null, reuniaoCom: [] });

		const readiness = checkTalkArtReadiness(talk);

		expect(readiness.ready && readiness.talk.palestrante.nome).toBe('Alcione Soledade');
	});
});

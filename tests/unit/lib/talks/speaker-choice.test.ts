import { describe, expect, it } from 'vitest';

import { createEmptySpeakerChoice, isSpeakerChoiceUnconfirmed } from '#lib/talks/speaker-choice.js';

describe('isSpeakerChoiceUnconfirmed', () => {
	it('flags a typed name that was neither chosen nor registered', () => {
		const choice = { ...createEmptySpeakerChoice(), texto: 'Carm' };

		expect(isSpeakerChoiceUnconfirmed(choice)).toBe(true);
	});

	it('accepts a speaker chosen from the list', () => {
		const choice = { ...createEmptySpeakerChoice(), texto: 'Carm', palestranteId: '4' };

		expect(isSpeakerChoiceUnconfirmed(choice)).toBe(false);
	});

	it('accepts a name to register', () => {
		const choice = { ...createEmptySpeakerChoice(), texto: 'Novo Nome', novoPalestrante: 'Novo Nome' };

		expect(isSpeakerChoiceUnconfirmed(choice)).toBe(false);
	});

	it('accepts a talk without a speaker', () => {
		const choice = { ...createEmptySpeakerChoice(), texto: '  ' };

		expect(isSpeakerChoiceUnconfirmed(choice)).toBe(false);
	});
});

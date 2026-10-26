import { describe, expect, it } from 'vitest';

import {
	MEETING_ACTIVITIES_MAX_COUNT,
	MEETING_ACTIVITY_MAX_LENGTH,
	meetingActivitiesSchema,
	talkChangeSchema,
	talkCreateSchema,
} from '#lib/validation/comunicacao/palestras.js';
import { getFieldErrors } from '../field-errors';

const VALID_CREATION = { data: '2026-03-09', horario: '08:45', local: null, reuniaoCom: 'Estudo do Evangelho' };

describe('meetingActivitiesSchema', () => {
	it('TU-01 normalizes meeting activities by dropping blank lines and edge spaces', () => {
		const result = meetingActivitiesSchema.parse('Palestra doutrinária\n\n  Passes e água fluidificada  ');

		expect(result).toEqual(['Palestra doutrinária', 'Passes e água fluidificada']);
	});

	it('TU-02 rejects more than five meeting activities', () => {
		const activities = Array.from({ length: MEETING_ACTIVITIES_MAX_COUNT + 1 }, (_, index) => `Atividade ${index}`);

		const result = talkChangeSchema.safeParse({ campo: 'reuniaoCom', valor: activities.join('\n') });

		expect(getFieldErrors(result)).toEqual({ valor: ['Informe até 5 atividades, uma por linha.'] });
	});

	it('TU-03 rejects a meeting activity longer than 32 characters', () => {
		const valor = `Estudo do Evangelho\n${'a'.repeat(MEETING_ACTIVITY_MAX_LENGTH + 1)}`;

		const result = talkChangeSchema.safeParse({ campo: 'reuniaoCom', valor });

		expect(getFieldErrors(result)).toEqual({ valor: ['Cada atividade deve ter até 32 caracteres.'] });
	});
});

describe('TU-05 meeting activities when creating a talk', () => {
	it('requires meeting activities', () => {
		const result = talkCreateSchema.safeParse({ ...VALID_CREATION, reuniaoCom: undefined });

		expect(getFieldErrors(result)).toEqual({ reuniaoCom: ['Informe um texto válido.'] });
	});

	it('normalizes meeting activities', () => {
		const result = talkCreateSchema.parse({ ...VALID_CREATION, reuniaoCom: ' Estudo do Evangelho \n\n' });

		expect(result.reuniaoCom).toEqual(['Estudo do Evangelho']);
	});

	it('accepts an empty list of meeting activities', () => {
		const result = talkCreateSchema.parse({ ...VALID_CREATION, reuniaoCom: '' });

		expect(result.reuniaoCom).toEqual([]);
	});
});

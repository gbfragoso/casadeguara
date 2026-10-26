import { describe, expect, it } from 'vitest';

import {
	MOVE_RANGE_MAX,
	TALK_LOCATION_MAX_LENGTH,
	TALK_NOTES_MAX_LENGTH,
	TALK_TITLE_MAX_LENGTH,
	talkChangeSchema,
	talkCreateSchema,
	talkMoveSchema,
	talkTargetSchema,
} from '#lib/validation/comunicacao/palestras.js';
import { getFieldErrors } from '../field-errors';

const VALID_CREATION = {
	data: '2026-03-09',
	horario: '08:45',
	local: 'Rua Major Dórea, 86, Castália, Itabuna-BA',
	reuniaoCom: 'Estudo do Evangelho',
};
const INVALID_MOVE_MESSAGE = 'Troca de datas inválida.';

const createMove = (ids: string[], versoes: string[], origemId = ids[0], destinoId = ids.at(-1)) => ({
	origemId,
	destinoId,
	ids,
	versoes,
});

describe('TU-10 talkCreateSchema', () => {
	it('accepts a date, a time and an empty location as a talk to define', () => {
		const result = talkCreateSchema.safeParse({ ...VALID_CREATION, local: '  ' });

		expect(result).toMatchObject({ success: true, data: { data: '2026-03-09', horario: '08:45', local: null } });
	});

	it.each([
		['data', 'Informe a data.'],
		['horario', 'Informe o horário.'],
	])('rejects a talk without %s', (field, message) => {
		const result = talkCreateSchema.safeParse({ ...VALID_CREATION, [field]: undefined });

		expect(getFieldErrors(result)).toEqual({ [field]: [message] });
	});

	it.each([
		['data', '', 'Informe a data.'],
		['data', '2026-02-30', 'Informe uma data válida.'],
		['horario', '', 'Informe o horário.'],
		['horario', '08:45:00', 'Informe um horário válido no formato HH:MM.'],
	])('rejects %s %j', (field, value, message) => {
		const result = talkCreateSchema.safeParse({ ...VALID_CREATION, [field]: value });

		expect(getFieldErrors(result)).toEqual({ [field]: [message] });
	});

	it('rejects a location with 61 characters', () => {
		const result = talkCreateSchema.safeParse({
			...VALID_CREATION,
			local: 'a'.repeat(TALK_LOCATION_MAX_LENGTH + 1),
		});

		expect(getFieldErrors(result)).toEqual({ local: ['O local deve ter até 60 caracteres.'] });
	});
});

describe('TU-10 talkChangeSchema', () => {
	it.each([
		['titulo', TALK_TITLE_MAX_LENGTH, 'O título deve ter até 70 caracteres.'],
		['observacoes', TALK_NOTES_MAX_LENGTH, 'As observações devem ter até 80 caracteres.'],
		['local', TALK_LOCATION_MAX_LENGTH, 'O local deve ter até 60 caracteres.'],
	])('TU-04 rejects %s above %i characters with the limit message', (campo, maxLength, message) => {
		const result = talkChangeSchema.safeParse({ campo, valor: 'a'.repeat(maxLength + 1) });

		expect(getFieldErrors(result)).toEqual({ valor: [message] });
	});

	it.each([
		['titulo', TALK_TITLE_MAX_LENGTH],
		['observacoes', TALK_NOTES_MAX_LENGTH],
		['local', TALK_LOCATION_MAX_LENGTH],
	])('TU-04 accepts %s at %i characters', (campo, maxLength) => {
		const result = talkChangeSchema.safeParse({ campo, valor: 'a'.repeat(maxLength) });

		expect(result.success).toBe(true);
	});
	it('clears a blank title to be defined later', () => {
		expect(talkChangeSchema.parse({ campo: 'titulo', valor: '   ' })).toEqual({ campo: 'titulo', valor: null });
	});

	it('keeps line breaks inside the notes', () => {
		const valor = 'Livro: Jesus e Atualidade,\nCap. 20';

		expect(talkChangeSchema.parse({ campo: 'observacoes', valor: ` ${valor} ` })).toEqual({
			campo: 'observacoes',
			valor,
		});
	});

	it.each([
		['data', 'Informe a data.'],
		['horario', 'Informe o horário.'],
	])('rejects a missing %s', (campo, message) => {
		const result = talkChangeSchema.safeParse({ campo, valor: '' });

		expect(getFieldErrors(result)).toEqual({ valor: [message] });
	});

	it.each([
		['', null],
		['4', 4],
	])('reads the speaker identifier %j', (valor, expected) => {
		expect(talkChangeSchema.parse({ campo: 'palestranteId', valor })).toEqual({
			campo: 'palestranteId',
			valor: expected,
		});
	});

	it('rejects a speaker identifier that is not a positive integer', () => {
		const result = talkChangeSchema.safeParse({ campo: 'palestranteId', valor: '-1' });

		expect(getFieldErrors(result)).toEqual({ valor: ['Palestrante inválido.'] });
	});

	it('trims the name of a new speaker', () => {
		expect(talkChangeSchema.parse({ campo: 'novoPalestrante', valor: '  Novo Nome ' })).toEqual({
			campo: 'novoPalestrante',
			valor: 'Novo Nome',
		});
	});

	it('rejects an unknown field', () => {
		expect(talkChangeSchema.safeParse({ campo: 'versao', valor: '2' }).success).toBe(false);
	});
});

describe('talkTargetSchema', () => {
	it('reads the identifier and the version from form text', () => {
		expect(talkTargetSchema.parse({ id: '31', versao: '3' })).toEqual({ id: 31, versao: 3 });
	});

	it('rejects a missing version', () => {
		expect(getFieldErrors(talkTargetSchema.safeParse({ id: '31' }))).toEqual({
			versao: ['Identificador inválido.'],
		});
	});
});

describe('talkMoveSchema', () => {
	it('pairs every identifier with its version in agenda order', () => {
		const result = talkMoveSchema.parse(createMove(['31', '32', '33'], ['3', '1', '2'], '33', '31'));

		expect(result).toEqual({
			originId: 33,
			targetId: 31,
			range: [
				{ id: 31, versao: 3 },
				{ id: 32, versao: 1 },
				{ id: 33, versao: 2 },
			],
		});
	});

	it('rejects versions that do not match the identifiers', () => {
		const result = talkMoveSchema.safeParse(createMove(['31', '32'], ['3']));

		expect(getFieldErrors(result)).toEqual({ versoes: [INVALID_MOVE_MESSAGE] });
	});

	it('rejects a repeated identifier', () => {
		const result = talkMoveSchema.safeParse(createMove(['31', '32', '31'], ['1', '1', '1'], '31', '32'));

		expect(getFieldErrors(result)).toMatchObject({ ids: [INVALID_MOVE_MESSAGE] });
	});

	it('rejects an origin that is not an end of the range', () => {
		const result = talkMoveSchema.safeParse(createMove(['31', '32', '33'], ['1', '1', '1'], '32', '33'));

		expect(getFieldErrors(result)).toEqual({ destinoId: [INVALID_MOVE_MESSAGE] });
	});

	it.each([
		['a single talk', 1],
		['more talks than the limit', MOVE_RANGE_MAX + 1],
	])('rejects %s', (_, length) => {
		const ids = Array.from({ length }, (__, index) => String(index + 1));

		const result = talkMoveSchema.safeParse(
			createMove(
				ids,
				ids.map(() => '1'),
			),
		);

		expect(getFieldErrors(result)).toMatchObject({ ids: [INVALID_MOVE_MESSAGE] });
	});
});

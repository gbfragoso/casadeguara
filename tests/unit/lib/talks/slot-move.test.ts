import { describe, expect, it } from 'vitest';

import { planSlotMove, type SlottedTalk } from '#lib/talks/slot-move.js';

const A = { id: 1, data: '2026-03-02', horario: '08:45' };
const B = { id: 2, data: '2026-03-07', horario: '14:30' };
const C = { id: 3, data: '2026-03-09', horario: '08:45' };
const D1 = { data: A.data, horario: A.horario };
const D2 = { data: B.data, horario: B.horario };
const D3 = { data: C.data, horario: C.horario };

const RANDOM_SEED = 20260302;
const BOARD_SIZE = 60;
const RANDOM_MOVES = 500;
const DAYS_IN_MARCH = 31;
const TALK_TIMES = ['08:45', '14:30'];
const PARK_MILLER_MULTIPLIER = 16807;
const PARK_MILLER_MODULUS = 2 ** 31 - 1;
const HALF_CHANCE = 0.5;

const createSeededRandom = (seed: number) => {
	let state = seed;
	return () => {
		state = (state * PARK_MILLER_MULTIPLIER) % PARK_MILLER_MODULUS;
		return state / PARK_MILLER_MODULUS;
	};
};

const pickIndex = (random: () => number, length: number) => Math.floor(random() * length);

const compareSlots = (left: SlottedTalk, right: SlottedTalk) =>
	left.data.localeCompare(right.data) || left.horario.localeCompare(right.horario) || left.id - right.id;

const createBoard = (random: () => number): SlottedTalk[] =>
	Array.from({ length: BOARD_SIZE }, (_, index) => ({
		id: index + 1,
		data: `2026-03-${String(pickIndex(random, DAYS_IN_MARCH) + 1).padStart(2, '0')}`,
		horario: TALK_TIMES[pickIndex(random, TALK_TIMES.length)],
	})).toSorted(compareSlots);

const listSlots = (talks: readonly SlottedTalk[]) => talks.map(({ data, horario }) => `${data} ${horario}`).toSorted();

const listIds = (talks: readonly SlottedTalk[]) => talks.map(({ id }) => id).toSorted((left, right) => left - right);

const moveRandomRange = (board: SlottedTalk[], random: () => number) => {
	const first = pickIndex(random, board.length - 1);
	const last = first + 1 + pickIndex(random, board.length - first - 1);
	const range = board.slice(first, last + 1);
	const [originIndex, targetIndex] = random() < HALF_CHANCE ? [0, range.length - 1] : [range.length - 1, 0];
	const plan = planSlotMove(range, originIndex, targetIndex);
	return [...board.slice(0, first), ...plan, ...board.slice(last + 1)];
};

describe('TU-06 planSlotMove', () => {
	it('gives B the first slot and A the second when A is dropped on B', () => {
		const plan = planSlotMove([A, B], 0, 1);

		expect(plan).toEqual([
			{ id: B.id, ...D1 },
			{ id: A.id, ...D2 },
		]);
	});

	it('shifts B and C up when A is dropped on C', () => {
		const plan = planSlotMove([A, B, C], 0, 2);

		expect(plan).toEqual([
			{ id: B.id, ...D1 },
			{ id: C.id, ...D2 },
			{ id: A.id, ...D3 },
		]);
	});

	it('shifts A and B down when C is dropped on A', () => {
		const plan = planSlotMove([A, B, C], 2, 0);

		expect(plan).toEqual([
			{ id: C.id, ...D1 },
			{ id: A.id, ...D2 },
			{ id: B.id, ...D3 },
		]);
	});

	it('keeps the other card fields with the moved card', () => {
		const titled = [
			{ ...A, titulo: 'A prece' },
			{ ...B, titulo: 'O perdão' },
		];

		const plan = planSlotMove(titled, 0, 1);

		expect(plan.map(({ id, titulo }) => ({ id, titulo }))).toEqual([
			{ id: B.id, titulo: 'O perdão' },
			{ id: A.id, titulo: 'A prece' },
		]);
	});
});

describe('TU-07 planSlotMove slot invariants', () => {
	it('changes no date when both talks share the same slot', () => {
		const first = { id: 1, ...D1 };
		const second = { id: 2, ...D1 };

		const plan = planSlotMove([first, second], 0, 1);

		expect(plan.map(({ data, horario }) => ({ data, horario }))).toEqual([D1, D1]);
	});

	it('keeps the board slot multiset after seeded random moves on 60 cards', () => {
		const random = createSeededRandom(RANDOM_SEED);
		const board = createBoard(random);

		const moved = Array.from({ length: RANDOM_MOVES }).reduce<SlottedTalk[]>(
			(current) => moveRandomRange(current, random),
			board,
		);

		expect(listSlots(moved)).toEqual(listSlots(board));
		expect(listIds(moved)).toEqual(listIds(board));
	});
});

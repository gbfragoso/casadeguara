import { vi } from 'vitest';

import { createTalkBoardHandlers } from '#lib/server/comunicacao/palestras/page-handlers.js';
import type { PalestraModel } from '#lib/server/models/palestra.js';
import type { SpeakerOption, TalkCard, WeekdayTimes } from '#lib/talks/types.js';

export const TODAY = '2026-03-01';
export const VOLUNTEER = 'comunicacao';
export const COORDINATOR = 'comunicacao:admin';

const NO_SUGGESTIONS: WeekdayTimes = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null };

export const createTalkCard = (id: number, data: string): TalkCard => ({
	id,
	data,
	horario: '08:45',
	titulo: null,
	observacoes: null,
	local: null,
	reuniaoCom: [],
	palestrante: null,
	versao: 1,
});

export const createFakeTalks = () => ({
	listAgenda: vi.fn<PalestraModel['listAgenda']>(async () => []),
	listHistory: vi.fn<PalestraModel['listHistory']>(async () => ({ rows: [] as TalkCard[], hasNext: false })),
	suggestTimes: vi.fn<PalestraModel['suggestTimes']>(async () => NO_SUGGESTIONS),
	create: vi.fn<PalestraModel['create']>(async () => ({ status: 'created', id: 1 })),
	update: vi.fn<PalestraModel['update']>(async () => ({ status: 'updated', versao: 2 })),
	move: vi.fn<PalestraModel['move']>(async () => ({
		status: 'moved',
		slot: { data: '2026-03-09', horario: '08:45' },
	})),
	remove: vi.fn<PalestraModel['remove']>(async () => true),
});

export const createFakeSpeakers = (options: SpeakerOption[] = []) => ({
	listOptions: vi.fn(async () => options),
});

export const createBoard = (talks = createFakeTalks(), speakers = createFakeSpeakers()) =>
	createTalkBoardHandlers({ talks, speakers, today: () => TODAY });

export const A4_WIDTH = 595.28;
export const A4_HEIGHT = 841.89;
export const CARDS_PER_PAGE = 6;
export const CARD_MARGIN = 18;
export const CARD_GAP = 8;
export const CARD_WIDTH = A4_WIDTH - CARD_MARGIN * 2;
export const CARD_HEIGHT = (A4_HEIGHT - CARD_MARGIN * 2 - CARD_GAP * (CARDS_PER_PAGE - 1)) / CARDS_PER_PAGE;

export type CardSlot = { x: number; y: number; width: number; height: number };

export const createCardSlots = (): CardSlot[] =>
	Array.from({ length: CARDS_PER_PAGE }, (_, index) => ({
		x: CARD_MARGIN,
		y: A4_HEIGHT - CARD_MARGIN - CARD_HEIGHT - index * (CARD_HEIGHT + CARD_GAP),
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
	}));

import { rgb } from 'pdf-lib';

export const PDF_COLORS = {
	blue: rgb(0.09, 0.45, 0.65),
	lightBlue: rgb(0.92, 0.96, 0.98),
	gray: rgb(0.29, 0.29, 0.29),
};

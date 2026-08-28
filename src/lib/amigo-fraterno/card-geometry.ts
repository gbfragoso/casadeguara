export const A4_WIDTH = 595.28;
export const A4_HEIGHT = 841.89;
export const CARDS_PER_PAGE = 6;

const POINTS_PER_CENTIMETER = 28.3464567;
const PHOTO_FRAME_VERTICAL_INSET = 24;

export const PAGE_MARGIN = POINTS_PER_CENTIMETER / 2;
export const VISIBLE_CARD_GAP = 1.5;
export const CARD_BORDER_WIDTH = 3;
export const CARD_SLOT_GAP = VISIBLE_CARD_GAP + CARD_BORDER_WIDTH;
export const CARD_WIDTH = A4_WIDTH - PAGE_MARGIN * 2;
export const CARD_HEIGHT = (A4_HEIGHT - PAGE_MARGIN * 2 - CARD_SLOT_GAP * (CARDS_PER_PAGE - 1)) / CARDS_PER_PAGE;

export const PHOTO_FRAME = {
	widthPoints: 86,
	heightPoints: CARD_HEIGHT - PHOTO_FRAME_VERTICAL_INSET,
	outputWidth: 239,
	outputHeight: 300,
};

export type CardSlot = { x: number; y: number; width: number; height: number };

export const createCardSlots = (): CardSlot[] =>
	Array.from({ length: CARDS_PER_PAGE }, (_, index) => ({
		x: PAGE_MARGIN,
		y: A4_HEIGHT - PAGE_MARGIN - CARD_HEIGHT - index * (CARD_HEIGHT + CARD_SLOT_GAP),
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
	}));

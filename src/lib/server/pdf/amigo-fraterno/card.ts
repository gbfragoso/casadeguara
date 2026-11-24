import type { AmigoFraternoPdfParticipant } from './participant-projections';
import { PHOTO_FRAME, type CardSlot } from '#lib/image/geometry/card.js';
import { PDF_COLORS } from './layout';
import { drawPhoto } from './photo';
import { fitName } from './text';
import type { PDFFont, PDFImage, PDFPage } from 'pdf-lib';

type CardAssets = { font: PDFFont; logo: PDFImage };
type NumberedCard = AmigoFraternoPdfParticipant & { number: string };
type FieldPlacement = { xOffset: number; topOffset: number; width: number };

const STUB_SEPARATOR_X = 235;
const STUB_LOGO_X = 203;
const LOGO_SIZE = 30;
const LINE_THICKNESS = 0.75;
const PHOTO_FRAME_X_OFFSET = 246;
const PHOTO_FRAME_Y_OFFSET = 12;
const NUMBER_SIZE = 20;
const NUMBER: FieldPlacement = { xOffset: 14, topOffset: 25, width: 40 };
const STUB_NAME: FieldPlacement = { xOffset: 14, topOffset: 68, width: 190 };
const BODY_NAME: FieldPlacement = { xOffset: 344, topOffset: 83, width: 200 };

const drawText = (page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont) =>
	page.drawText(text, { x, y, size, font, color: PDF_COLORS.black });

const drawLogo = (page: PDFPage, logo: PDFImage, x: number, slot: CardSlot) =>
	page.drawImage(logo, { x, y: slot.y + slot.height - 35, width: LOGO_SIZE, height: LOGO_SIZE });

const drawName = (page: PDFPage, name: string, slot: CardSlot, font: PDFFont, placement: FieldPlacement) => {
	const fitted = fitName(name, font, placement.width);
	const x = slot.x + placement.xOffset;
	const y = slot.y + slot.height - placement.topOffset;
	fitted.lines.forEach((line, index) => drawText(page, line, x, y - index * (fitted.size + 2), fitted.size, font));
};

const drawNumber = (page: PDFPage, number: string, slot: CardSlot, font: PDFFont) =>
	drawText(page, number, slot.x + NUMBER.xOffset, slot.y + slot.height - NUMBER.topOffset, NUMBER_SIZE, font);

const drawFillLine = (page: PDFPage, slot: CardSlot, placement: FieldPlacement) => {
	const x = slot.x + placement.xOffset;
	const y = slot.y + slot.height - placement.topOffset;
	page.drawLine({ start: { x, y }, end: { x: x + placement.width, y }, thickness: LINE_THICKNESS });
};

const drawStub = (page: PDFPage, slot: CardSlot, assets: CardAssets) => {
	drawText(page, 'Representado(a) por:', slot.x + 14, slot.y + 38, 11, assets.font);
	page.drawLine({
		start: { x: slot.x + 14, y: slot.y + 18 },
		end: { x: slot.x + 220, y: slot.y + 18 },
		thickness: LINE_THICKNESS,
	});
	page.drawLine({
		start: { x: slot.x + STUB_SEPARATOR_X, y: slot.y },
		end: { x: slot.x + STUB_SEPARATOR_X, y: slot.y + slot.height },
		thickness: LINE_THICKNESS,
		dashArray: [3, 3],
	});
	drawLogo(page, assets.logo, slot.x + STUB_LOGO_X, slot);
};

const drawBody = (page: PDFPage, slot: CardSlot, assets: CardAssets, nextDrawDate: string) => {
	drawText(page, 'Amigo Fraterno', slot.x + 344, slot.y + slot.height - 25, 16, assets.font);
	drawText(page, `Próximo sorteio: ${nextDrawDate}`, slot.x + 344, slot.y + slot.height - 52, 11, assets.font);
	drawText(page, '"Existem muitos caminhos para felicidade...', slot.x + 344, slot.y + 28, 10, assets.font);
	drawText(page, 'Um deles é a Casa de Guará!"', slot.x + 380, slot.y + 12, 10, assets.font);
	drawLogo(page, assets.logo, slot.x + slot.width - LOGO_SIZE - 8, slot);
};

const drawTemplate = (page: PDFPage, slot: CardSlot, assets: CardAssets, nextDrawDate: string) => {
	page.drawRectangle({ ...slot, borderColor: PDF_COLORS.blue, borderWidth: 3 });
	drawStub(page, slot, assets);
	drawBody(page, slot, assets, nextDrawDate);
};

const drawPhotoFrame = (page: PDFPage, photo: Uint8Array | null, slot: CardSlot) =>
	drawPhoto(page, photo, {
		x: slot.x + PHOTO_FRAME_X_OFFSET,
		y: slot.y + PHOTO_FRAME_Y_OFFSET,
		width: PHOTO_FRAME.widthPoints,
		height: PHOTO_FRAME.heightPoints,
	});

export const drawCard = async (
	page: PDFPage,
	participant: NumberedCard,
	slot: CardSlot,
	assets: CardAssets,
	nextDrawDate: string,
) => {
	drawTemplate(page, slot, assets, nextDrawDate);
	drawNumber(page, participant.number, slot, assets.font);
	drawName(page, participant.name, slot, assets.font, STUB_NAME);
	drawName(page, participant.name, slot, assets.font, BODY_NAME);
	await drawPhotoFrame(page, participant.photo, slot);
};

export const drawBlankCard = async (page: PDFPage, slot: CardSlot, assets: CardAssets, nextDrawDate: string) => {
	drawTemplate(page, slot, assets, nextDrawDate);
	drawFillLine(page, slot, NUMBER);
	drawFillLine(page, slot, STUB_NAME);
	drawFillLine(page, slot, BODY_NAME);
	await drawPhotoFrame(page, null, slot);
};

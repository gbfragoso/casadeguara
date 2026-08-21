import type { AmigoFraternoPdfParticipant } from './participant-projections';
import { PDF_COLORS, type CardSlot } from './pdf-layout';
import { fitName } from './pdf-text';
import type { PDFFont, PDFImage, PDFPage } from 'pdf-lib';

type CardAssets = { font: PDFFont; logo: PDFImage };
type NumberedCard = AmigoFraternoPdfParticipant & { number: string };
const STUB_SEPARATOR_X = 235;
const STUB_LOGO_X = 203;
const LOGO_SIZE = 30;

const drawText = (page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont) =>
	page.drawText(text, { x, y, size, font, color: PDF_COLORS.black });

const drawPhoto = async (page: PDFPage, participant: NumberedCard, slot: CardSlot) => {
	const width = 86;
	const height = slot.height - 24;
	const x = slot.x + 246;
	const y = slot.y + 12;
	page.drawRectangle({ x, y, width, height, borderColor: PDF_COLORS.black, borderWidth: 0.75 });
	if (!participant.photo) return;
	const photo = await page.doc.embedJpg(participant.photo);
	const size = photo.scaleToFit(width - 4, height - 4);
	page.drawImage(photo, { x: x + (width - size.width) / 2, y: y + (height - size.height) / 2, ...size });
};

const drawName = (page: PDFPage, name: string, slot: CardSlot, font: PDFFont, x: number, y: number, width: number) => {
	const fitted = fitName(name, font, width);
	fitted.lines.forEach((line, index) => drawText(page, line, x, y - index * (fitted.size + 2), fitted.size, font));
};

export const drawCard = async (
	page: PDFPage,
	participant: NumberedCard,
	slot: CardSlot,
	assets: CardAssets,
	nextDrawDate: string,
) => {
	page.drawRectangle({ ...slot, borderColor: PDF_COLORS.blue, borderWidth: 3 });
	drawText(page, participant.number, slot.x + 14, slot.y + slot.height - 20, 20, assets.font);
	drawName(page, participant.name, slot, assets.font, slot.x + 14, slot.y + slot.height - 68, 190);
	drawText(page, 'Representado(a) por:', slot.x + 14, slot.y + 38, 11, assets.font);
	page.drawLine({
		start: { x: slot.x + 14, y: slot.y + 18 },
		end: { x: slot.x + 220, y: slot.y + 18 },
		thickness: 0.75,
	});
	page.drawLine({
		start: { x: slot.x + STUB_SEPARATOR_X, y: slot.y },
		end: { x: slot.x + STUB_SEPARATOR_X, y: slot.y + slot.height },
		thickness: 0.75,
		dashArray: [3, 3],
	});
	page.drawImage(assets.logo, {
		x: slot.x + STUB_LOGO_X,
		y: slot.y + slot.height - 35,
		width: LOGO_SIZE,
		height: LOGO_SIZE,
	});
	await drawPhoto(page, participant, slot);
	drawText(page, 'Amigo Fraterno', slot.x + 382, slot.y + slot.height - 25, 16, assets.font);
	drawText(page, `Próximo sorteio: ${nextDrawDate}`, slot.x + 344, slot.y + slot.height - 52, 11, assets.font);
	drawName(page, participant.name, slot, assets.font, slot.x + 344, slot.y + slot.height - 83, 200);
	drawText(page, '"Existem muitos caminhos para felicidade...', slot.x + 360, slot.y + 28, 10, assets.font);
	drawText(page, 'Um deles é a Casa de Guará!"', slot.x + 385, slot.y + 12, 10, assets.font);
	page.drawImage(assets.logo, {
		x: slot.x + slot.width - LOGO_SIZE - 8,
		y: slot.y + slot.height - 35,
		width: LOGO_SIZE,
		height: LOGO_SIZE,
	});
};

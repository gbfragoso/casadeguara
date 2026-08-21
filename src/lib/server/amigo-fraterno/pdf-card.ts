import type { AmigoFraternoPdfParticipant } from './participant-projections';
import { PDF_COLORS, type CardSlot } from './pdf-layout';
import { fitName } from './pdf-text';
import type { PDFFont, PDFImage, PDFPage } from 'pdf-lib';

type CardAssets = { font: PDFFont; logo: PDFImage };
type NumberedCard = AmigoFraternoPdfParticipant & { number: string };

const drawText = (page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont) =>
	page.drawText(text, { x, y, size, font, color: PDF_COLORS.gray });

const drawPhoto = async (page: PDFPage, participant: NumberedCard, slot: CardSlot) => {
	const x = slot.x + 178;
	const y = slot.y + 15;
	page.drawRectangle({ x, y, width: 75, height: slot.height - 30, borderColor: PDF_COLORS.blue, borderWidth: 1 });
	if (!participant.photo) return;
	const photo = await page.doc.embedJpg(participant.photo);
	const size = photo.scaleToFit(71, slot.height - 34);
	page.drawImage(photo, { x: x + (75 - size.width) / 2, y: y + (slot.height - 30 - size.height) / 2, ...size });
};

const drawName = (page: PDFPage, name: string, slot: CardSlot, font: PDFFont) => {
	const fitted = fitName(name, font, 128);
	fitted.lines.forEach((line, index) =>
		drawText(page, line, slot.x + 275, slot.y + slot.height - 40 - index * (fitted.size + 2), fitted.size, font),
	);
};

export const drawCard = async (page: PDFPage, participant: NumberedCard, slot: CardSlot, assets: CardAssets) => {
	page.drawRectangle({ ...slot, borderColor: PDF_COLORS.blue, borderWidth: 1, color: PDF_COLORS.lightBlue });
	page.drawLine({
		start: { x: slot.x + 150, y: slot.y },
		end: { x: slot.x + 150, y: slot.y + slot.height },
		thickness: 1,
		color: PDF_COLORS.blue,
	});
	drawText(page, 'LISTA DE PRESENÇA', slot.x + 12, slot.y + slot.height - 20, 8, assets.font);
	drawText(page, `Nº ${participant.number}`, slot.x + 12, slot.y + slot.height - 38, 11, assets.font);
	drawText(page, participant.name, slot.x + 12, slot.y + slot.height - 57, 9, assets.font);
	drawText(page, 'Representado(a) por: __________________', slot.x + 12, slot.y + 18, 8, assets.font);
	drawText(page, 'Amigo Fraterno', slot.x + 275, slot.y + slot.height - 20, 15, assets.font);
	drawText(page, 'Data: ____ / ____ / ______', slot.x + 275, slot.y + 18, 8, assets.font);
	drawText(page, 'Grupo Espírita Casa de Guará', slot.x + 395, slot.y + slot.height - 43, 8, assets.font);
	drawText(page, 'Existem vários caminhos para a Felicidade...', slot.x + 275, slot.y + 38, 7, assets.font);
	drawText(page, 'E um deles é a Casa de Guará!', slot.x + 275, slot.y + 28, 7, assets.font);
	page.drawImage(assets.logo, { x: slot.x + slot.width - 55, y: slot.y + 12, width: 42, height: 42 });
	drawName(page, participant.name, slot, assets.font);
	await drawPhoto(page, participant, slot);
};

import { PDFDocument } from 'pdf-lib';

import type { AmigoFraternoPdfParticipant } from './participant-projections';
import { loadPdfAssets } from './pdf-assets';
import { drawCard } from './pdf-card';
import { A4_HEIGHT, A4_WIDTH } from './pdf-layout';
import { numberParticipants, paginateCards } from './pdf-pagination';

export const sortPdfParticipants = (participants: AmigoFraternoPdfParticipant[]) =>
	[...participants].sort(
		(left, right) => left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' }) || left.id - right.id,
	);

export const generateAmigoFraternoPdf = async (participants: AmigoFraternoPdfParticipant[]) => {
	const document = await PDFDocument.create();
	const assets = await loadPdfAssets(document);
	const pages = paginateCards(numberParticipants(sortPdfParticipants(participants)));
	for (const cards of pages) {
		const page = document.addPage([A4_WIDTH, A4_HEIGHT]);
		for (const { participant, slot } of cards) await drawCard(page, participant, slot, assets);
	}
	return { bytes: await document.save(), pageCount: pages.length };
};

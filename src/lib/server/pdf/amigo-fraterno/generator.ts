import { PDFDocument } from 'pdf-lib';

import { A4_HEIGHT, A4_WIDTH } from '$lib/image/geometry/card';
import type { AmigoFraternoPdfParticipant } from './participant-projections';
import { loadPdfAssets } from './assets';
import { drawCard } from './card';
import { formatNextDrawDate } from './date';
import { numberParticipants, paginateCards } from './pagination';

export const sortPdfParticipants = (participants: AmigoFraternoPdfParticipant[]) =>
	[...participants].sort(
		(left, right) => left.name.localeCompare(right.name, 'pt-BR', { sensitivity: 'base' }) || left.id - right.id,
	);

export const generateAmigoFraternoPdf = async (participants: AmigoFraternoPdfParticipant[], nextDrawDate: string) => {
	const document = await PDFDocument.create();
	const assets = await loadPdfAssets(document);
	const pages = paginateCards(numberParticipants(sortPdfParticipants(participants)));
	for (const cards of pages) {
		const page = document.addPage([A4_WIDTH, A4_HEIGHT]);
		for (const { participant, slot } of cards)
			await drawCard(page, participant, slot, assets, formatNextDrawDate({ nextDrawDate }));
	}
	return { bytes: await document.save(), pageCount: pages.length };
};
